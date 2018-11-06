var logs = '';

function __log(e, data) {
    var logsEnabled = localStorage.getItem("debug");
    if(logsEnabled === 'true') {
        $('.logs-layout').show();
        console.log(e + " " + (data || ''));
        if($('#hide-logs-button').html() === 'Hide') {
            $('#logs').append("<p>" + e + " " + (data || '') + "</p>");
        } else {
            logs += "<p>" + e + " " + (data || '') + "</p>";
        }
    }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var audio_context;
var recorder;
var filename;
var analysisMethods;
var analyser;

function startUserMedia(stream) {
    analyser = audio_context.createAnalyser();
    var input = audio_context.createMediaStreamSource(stream);
    __log('Media stream created.');
    // Uncomment if you want the audio to feedback directly
    //input.connect(audio_context.destination);
    //__log('Input connected to audio context destination.');
    input.connect(analyser);

    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    // console.log(bufferLength);
    dataArray = new Uint8Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    draw();

    recorder = new Recorder(input, {
        sampleRate: 16000,
        workerPath: 'assets/js/recorderWorker.js'
    });
    __log('Recorder initialised.');
}

var recButton = document.getElementById("red-rec");

function toggleRecording(e) {
    e = e.target;

    if (e.classList.contains("recording")) {
        // stop recording
        recButton.classList.add("hidden");
        recorder && recorder.stop();
        e.classList.remove("recording");
        e.innerHTML = 'Start&nbsp;<i class="fas fa-microphone"></i>';
        // create WAV download link using audio data blob
        createDownloadLink();
        recorder.clear();
        
        $('.methods').removeClass("btn-primary").addClass("btn-secondary");

    } else {
        // start recording
        if (!recorder)
            return;
        e.classList.add("recording");
        recButton.classList.remove("hidden");
        recorder && recorder.record();
        __log('Recording...');
        e.innerHTML = "Stop";
        document.getElementById("filename").innerHTML = '';
        $('.progress-bar').css('width', 0 + '%');
        $('.progress-bar').html('Upload: ' + 0 + '%');
    }
}

var canvas;
var canvasCtx;
var bufferLength;
var dataArray;
var WIDTH = 300;
var HEIGHT = 100;
var drawVisual;

function draw() {
    drawVisual = requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;

    for(var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i]/2;

        canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
        canvasCtx.fillRect(x,HEIGHT-barHeight,barWidth,barHeight);

        x += barWidth + 1;
    }
};

function createDownloadLink() {

    recorder && recorder.exportWAV(function (blob) {
        
        var blobUrl = URL.createObjectURL(blob);
        document.getElementById("original_audio_source").src = blobUrl;
        document.getElementById("original_audio").load()
        
        var data = new FormData();
        filename = new Date().valueOf() + '.wav';
        localStorage.setItem("filename", filename);

        data.append('filename', filename);
        data.append('file', blob);
        var urlToPost = window.location.href + "index.php/main/upload";
        $.ajax({
            url: urlToPost,
            type: 'POST',
            data: data,
            contentType: false,
            processData: false,
            xhr: function () {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    $('#prog-bar').show();
                    myXhr.upload.addEventListener('progress', progress, false);
                }
                return myXhr;
            },
            success: function (data) {
                __log("Audio file successfully uploaded!", data);
                // Hid the filename for now (people don't need to know it)
                //document.getElementById("filename").innerHTML = localStorage.getItem("filename");
                document.getElementById("filename").innerHTML = "Audio uploaded to the server";
                $('#methods').show();
                $(document).scrollTop( $("#methods").offset().top );
            },
            error: function (error) {
                __log("Error. Failed to upload audio!", error);
                document.getElementById("filename").innerHTML = 'Failed to upload';
            }
        });
        // Recorder.setupDownload(blob, new Date().toISOString() + '.wav');
    });
}

function progress(e) {
    if (e.lengthComputable) {
        var max = e.total;
        var current = e.loaded;
        var Percentage = (current * 100) / max;
        $('.progress-bar').css('width', Percentage + '%');
        $('.progress-bar').html('Upload: ' + Percentage + '%');
        // __log(Percentage);
        if (Percentage >= 100) {
            __log('Upload complete!');
            document.getElementById("original_audio").style.visibility = "visible";
        }
    }
}

function selectMethod(e) {
    //__log('Select method clicked', e);
    if ($(e.target).attr("method-id") != null) {
        $('#results').hide();
        document.getElementById("other-result").innerHTML = '';
        document.getElementById("sample-chart").innerHTML = '';
        $('#sample-chart').hide();

        var id = $(e.target).attr("method-id");
        __log("id", id);

        $('.methods').removeClass("btn-primary").addClass("btn-secondary");
        $(e.target).removeClass("btn-secondary").addClass("btn-primary");

        if(analysisMethods[id].hasOwnProperty('additional_parameters')) {
            var additionalParameters = analysisMethods[id]['additional_parameters'];
            __log('Method required additional parameters');
            var Form = JSONSchemaForm.default;
            var schema = additionalParameters.schema;
            var uiSchema = additionalParameters.uiSchema;

            console.log('schema', schema);
            console.log('uischema', uiSchema);
    
            ReactDOM.render(React.createElement(Form, { 
                schema: schema,
                uiSchema: uiSchema,
                // onChange: log("changed"),
                onSubmit: function(data) {
                    __log('data submitted', data.formData);
                    $('#loader').show();
                    runAnalysis(id, data.formData);
                },
                onError: function(error) {
                    _log('Error in form', error);
                }
            }), document.getElementById("app"));

            $('#app').show();
            $(document).scrollTop( $("#app").offset().top );
        } else {
            $('#app').hide();
            $('#loader').show();
            runAnalysis(id, null);
        }
    }
}

function runAnalysis (methodChosen, additionalParameters) {
    var data = new FormData();
    data.append('method', methodChosen);
    data.append('filename', filename);

    var params = '';

    if (additionalParameters !== null) {
        for (var parameter in additionalParameters) {
            if (additionalParameters.hasOwnProperty(parameter)) {
                params += additionalParameters[parameter] + ' ';
            }
        }
        data.append('additional_parameters', params);
    }

    __log('Data to be analyzed');
    
    // Display the key/value pairs
    for (var pair of data.entries()) {
        __log(pair[0]+ ', ' + pair[1]); 
    }

    var urlToPost = window.location.href + "index.php/main/analyze";

    $.ajax({
        url: urlToPost,
        type: 'POST',
        data: data,
        contentType: false,
        processData: false,
        success: function (result) {
            $('#app').hide();
            $('#loader').hide();
            $('#results').show();
            __log("Received results");
            
            // The result might be loaded up as a JSON
            // already
            if (typeof(result) == "string") {
                result = JSON.parse(result);
            }
            
            __log("Parsed results correctly! Results: ", JSON.stringify(result));
            
            if (result.type === 'chart') {
                __log('draw chart');
                $('#sample-chart').show();
                var myChart = Highcharts.chart('sample-chart', result.data);
            } else if (result.type === 'html') {
                document.getElementById("other-result").innerHTML = result.data;
            } else if (result.type === 'image') {
                document.getElementById("other-result").innerHTML = '<img src="' + result.data + '" alt="result" />';
            } else if (result.type === 'audio') {
                document.getElementById("other-result").innerHTML = '<audio class="audio-result" controls><source src="' + result.data + '" type="audio/wav">Your browser does not support the audio element.</audio>';
            }

            $('#results').show();
            $(document).scrollTop( $("#results").offset().top );  
        },
        error: function (error) {
            $('#loader').hide();
            if(error.responseText) {
                __log('error from ajax', error.responseText)
            } else {
                __log("Error. Failed to analyze audio!", error);
                console.log(error);
            }
        }
    });
}

window.onload = function init() {
    var url = window.location.href;

    if(getParameterByName('debug') === 'true') {
        localStorage.setItem("debug", true);    
        url = url.slice(0, -11);
        document.location.href=url;
    } else if(getParameterByName('debug') === 'false') {
        localStorage.setItem("debug", false);
        url = url.slice(0, -12);
        document.location.href=url;
    }

    try {
        // webkit shim
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        window.URL = window.URL || window.webkitURL;
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.mediaDevices.getUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

        audio_context = new AudioContext;
        __log('Audio context set up.');
        __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
        alert('No web audio support in this browser!');
    }

    navigator.getUserMedia({
        "audio": {
            "mandatory": {
                "googEchoCancellation": "false",
                "googAutoGainControl": "false",
                "googNoiseSuppression": "false",
                "googHighpassFilter": "false"
            },
            "optional": []
        },
    }, startUserMedia, function (e) {
        __log('No live audio input: ' + e);
    });

    var toggleBtn = document.getElementById('recToggleBtn');
    toggleBtn.addEventListener('click', toggleRecording, false);

    var urlForMethods = window.location.href + "index.php/main/getmethods";
    $.ajax({
        url: urlForMethods,
        type: 'GET',
        contentType: false,
        processData: false,
        success: function (result) {
            __log("get methods successful!", JSON.parse(result));
            analysisMethods = JSON.parse(result);

            var htmlToAppend = '';

            var counter = 0;
            for (var method in analysisMethods) {
                if (analysisMethods.hasOwnProperty(method)) {
                    htmlToAppend += '<div class="col-sm-3 card">';
                    htmlToAppend +=  '<h2>' + analysisMethods[method]['name'] + '</h2>';
					htmlToAppend +=  '<p>' + analysisMethods[method]['desc'] + '</p>';
					htmlToAppend +=  '<button class="btn btn-secondary methods" role="button" method-id="' + method + '">Run demo</button>';
					htmlToAppend +=  '</div>';
                }
            }

            $('#methods-list').append(htmlToAppend);

            var list = document.getElementsByClassName('methods');
            for (var i = 0; i < list.length; i++) {
                var element = list[i];
                element.addEventListener('click', selectMethod, false);
            }

        },
        error: function (error) {
            __log("Error. Failed to get methods!", error);
        }
    });

    $('#clear-logs-btn').click(function() {
        $('#logs').html('');
    });

    $('#hide-logs-button').click(function() {
        if($('#hide-logs-button').html() === 'Hide') {
            logs = $('#logs').html();
            $('#hide-logs-button').html('Show');
            $('#logs').html('');
        } else {
            $('#hide-logs-button').html('Hide');
            $('#logs').html(logs);
        }
    });

    canvas = document.getElementById('myCanvas'); // in your HTML this element appears as <canvas id="myCanvas"></canvas>
    canvasCtx = canvas.getContext('2d');
};
