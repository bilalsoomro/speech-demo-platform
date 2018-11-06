# Web platform for demonstrating speech processing

A web platform for demonstrating different speech-analysis systems.

Built with two main motivators: **Easy to add new systems for demonstration**, and **accessible everywhere**.

Easy to add new systems for demonstration: Adding couple of lines to a single JSON file.

Accessible everywhere: Built as a HTTP service in PHP.

## An example of what it does

1) User loads up the page and records audio (16kHz PCM as WAV).
2) Recorded audio is uploaded to the server
3) User selects an analysis method X to run on the recorded speech
4) (Optional) Page asks user to fill in additional info (e.g. claimed speaker id) 
5) Server calls command associated with analysis method X (defined in `scripts/methods.json`)
6) The called program writes results to file given as a parameter, and server reads the results
7) Server returns these results to client, and client displays results with varying utilies to user

## Getting started in 30 seconds

Requirements: A web server with support for PHP.

1. Wrap your system under one command call which takes at least two arguments:
    * Output file (path to a text file which will be read and returned to user)
    * Input file (path to WAV file of recorded speech)
    * Any additional arguments your code needs (e.g. Claimed speaker ID for speaker verification)
2. Place this directory somewhere visible to HTTP requests.
3. Edit `scripts/methods.json` by adding a new analysis method along with command 
   to run your system for provided audio file (WAV)

`scripts/methods.json` provides examples on how to add your system in the list
of supported methods on the webpage. 

## Adding new analysis methods

Adding your analysis method to list of available methods is done by modifying `scripts/methods.json`.
This JSON structure defines list of available analysis methods with following structure:

```json
"method_#": {
        "name": "[Name shown on web page]",
        "cmd": "Command to be called",
        "desc": "[Slightly longer description of the method",
        "additional_parameters": {
            ...
        }
}
```

Adding new analysis method is done by adding these structures to the end of the list. Remember
to update the key's index from `method_#` to an unique key.

The `cmd` part defines what kind of system call should be done to execute the analysis, e.g. 
setting it to `python3 your_python_script.py` will launch Python with script `your_python_script.py`.
This call is done with some additional parameters, in following order:
    
    1) Result file: Path to a file which should contain results in JSON format after processing.
    2) Audio file: Path to the received audio file from the client
    3) (Optional) Additional parameter 1: An optional parameter from user, defined in `additional_parameters`
    4) (Optional) Additional parameter 2: ...

Hence the final call to our example command will be `python3 your_python_script.py path_to_output path_to_wav [param1] [param2] [...]`.

The `additional_parameters` part defines if there are additional parameters required from user other than
their speech. If this part does not exist, no additional parameters are queried. The first example method
in `scripts/methods.json` includes an example of asking name and age of the user. The inputs from user
are sanitized and included in the system call, in same order they are defined in `required` part of the 
Schema structure. 

## Hacking & Major files of this project

* `assets/js/`: Contains majority of the client side logic. `sound.js` is the main file.
* `application/controllers/Main.php`: Contains majority of server side logic (receiving files, running systems, etc).
* `application/views/home.php`: Contains majority of the HTML of the webpage.
* `scripts`: Defines the available analysis methods in `methods.json` 

## Troubleshooting

* Remember to make sure the JSON syntax is valid. Commas are not allowed at the end of final item of a dictionary, for example.
* Remember to set permissions appropiately: A different user should be able to launch your analysis method on server. Same 
  applies to storing/reading/removing files.

## Issues and possible improvements

* The website does not work correctly under Mac/iOS and/or Safari
* Make it possible to change directory of stored samples to something else than `sys_get_temp_dir()`.

## Built with and/or ontop of...

* CodeIgniter
* Bootstrap
* React
* Popper
* Highcharts

## License 
Code original to this project is under MIT license. Code original to 
CodeIgniter is shared under MIT license.
