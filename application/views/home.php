<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?><!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<title>Analysis Demo</title>
	<link href="./assets/css/main.css" rel="stylesheet">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
</head>
<body>

	<div class="container">
		<div class="text-center">
			<h1 class="display-4">Demo</h1>
			<p class="lead">Record your audio and then select any method below</p>
			<button id="recToggleBtn" class="btn btn-primary my-2">Start&nbsp;<i class="fas fa-microphone"></i></button>
			
			<p id="red-rec" class="hidden font-weight-bold"><button class="rec-button Rec">Recording</button> Recording</p>
			<div>
				<canvas id="myCanvas"></canvas>
			</div>
			<div id="prog-bar" class="progress">
				<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
			</div>
			<audio id="original_audio" class="audio-result" style="visibility: hidden;" controls>
                <source id="original_audio_source" src="" type="audio/wav">
                Your browser does not support the audio element.
            </audio>
			<p id="filename"></p>
		</div>
		<br>
		<div id="methods">
			<h3 class="custom-title">Analysis methods</h3>
			<div id="methods-list" class="scrolling-wrapper-flexbox"></div>
		</div>
		<!-- <hr> -->
		<br>
		<div id="app"></div>
		<div id="loader"></div>
		<div id="results" class="hidden animate-bottom">
			<h3 class="custom-title">Results:</h3>
			<p id="other-result"></p>
			<div id="sample-chart" style="width:100%; height:400px;"></div>
		</div>
		<div class="logs-layout">
			<div class="log-labels">
				<h3 class="custom-title">Logs:</h3>
				<button id="clear-logs-btn" type="button" class="btn btn-danger">Clear</button>
				<button id="hide-logs-button" type="button" class="btn btn-info">Hide</button>
			</div>
			<div id="logs"></div>
		</div>
	</div>

	<script
        src="https://code.jquery.com/jquery-3.3.1.min.js"
        integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
        crossorigin="anonymous">
    </script>
	<script src="https://code.highcharts.com/highcharts.js"></script>
	
	<script crossorigin src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/react-jsonschema-form/dist/react-jsonschema-form.js"></script>

	<script src="assets/js/recorderWorker.js"></script>
	<script src="assets/js/recorder.js"></script>
	<script src="assets/js/sound.js"></script>
</body>
</html>
