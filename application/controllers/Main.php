<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Main extends CI_Controller {

	public function index()
	{
		if(empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == "off"){
			$redirect = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
			header('HTTP/1.1 301 Moved Permanently');
			header('Location: ' . $redirect);
			exit();
		}

		$this->load->view('home'); // pass $data to view
	}

	public function getmethods() {
		$string = file_get_contents("./scripts/methods.json"); // read json file
		echo $string;
	}

	public function upload($filename = '') {

		$result = array(
			'success' => TRUE
		);

		$filename = $_POST['filename'];

		if(isset($_FILES['file']) and !$_FILES['file']['error']) {
			try {
				error_log($_FILES['file']['tmp_name']);

				if (!move_uploaded_file($_FILES['file']['tmp_name'], sys_get_temp_dir() . "/" . $filename)) {
					throw new RuntimeException('Failed to move uploaded file.');
				}
			} catch (RuntimeException $e) {
				$result = array(
					'success' => FALSE,
					'reason' => $e.getMessage()
				);
			}

		} else {
			$result = array(
				'success' => FALSE,
				'reason' => 'Unknown'
			);
		}

		echo json_encode($result);

	}

	public function analyze() {

		$filename = $_POST['filename'];
		$methodSelected = $_POST['method'];

		$additional_params = NULL;

		if(isset($_POST['additional_parameters'])) {
			$additional_params = $_POST['additional_parameters'];
		}

		$methodsAvailable = file_get_contents("./scripts/methods.json"); // read json file
		
		$methodsAvailable = json_decode($methodsAvailable, true);

		$output = NULL;
		$return_var = NULL;

		$temp_name = uniqid()  . '.json';

		$fp = fopen(sys_get_temp_dir() . '/'. $temp_name, 'w');

		fclose($fp);

		foreach($methodsAvailable as $method => $item) { //foreach element in $arr
			if($methodSelected == $method) {
				if(is_null($additional_params) === FALSE) {
                    // Sanitize additional parameters
                    // Use `escapeshellcmd` to escape naughty characters
                    // And add quotations around individual parameters
                    $additional_params = escapeshellcmd($additional_params);
                    $additional_params = '"'.str_replace(' ', '" "', $additional_params).'"';
                    
					exec($item['cmd'] . ' ' . sys_get_temp_dir() . '/'. $temp_name . ' ' . sys_get_temp_dir() . "/" . $filename . ' ' . $additional_params .' 2>&1', $output, $return_var);
				} else {
                    // No user input here, no need for sanitization
					exec($item['cmd'] . ' ' . sys_get_temp_dir() . '/'. $temp_name . ' ' . sys_get_temp_dir() . "/" . $filename . ' 2>&1', $output, $return_var);
                }
                
                if($return_var == 0) {
                    $result = file_get_contents(sys_get_temp_dir() . '/'. $temp_name); // read json file
                } else {
                    // There was an error 
                    error_log("[ERROR] Analyzer returned with code " . $return_var);
                    $result = json_encode(array(
                        'success' => FALSE,
                        'reason' => "Method returned code " . $return_var
                    ));
                }
			}
		}

		header('Content-type:application/json;charset=utf-8');
		echo $result;
	}

	public function check($filename = '') {
		if (is_readable(sys_get_temp_dir() . "/" .$filename)) {
			echo 1;
		} else {
			echo 0;
		}
	}
}
