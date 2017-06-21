/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null,
	realAudioInput = null,
	inputPoint = null,
	audioRecorder = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;
var topDb = 0,
	sumDb = 0,
	count = 0,
	audioStateNum =0;


function drawBuffer(width, height, context, buffer) {
	var data = buffer.getChannelData(0);
	var step = Math.ceil(data.length / width);
	var amp = height / 2;
	for (var i = 0; i < width; i++) {
		var min = 1.0;
		var max = -1.0;
		for (var j = 0; j < step; j++) {
			var datum = data[(i * step) + j];
			if (datum < min)
				min = datum;
			if (datum > max)
				max = datum;
		}
		context.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
	}
}

/* TODO:

- offer mono option
- "Monitor input" switch
*/

function saveAudio() {
	audioRecorder.exportWAV(doneEncoding);
	// could get mono instead by saying
	// audioRecorder.exportMonoWAV( doneEncoding );
}

function gotBuffers(buffers) {
	var canvas = document.getElementById("canvas");

	drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffers[0]);

	// the ONLY time gotBuffers is called is right after a new recording is completed - 
	// so here's where we should set up the download.
	audioRecorder.exportWAV(doneEncoding);
}

function doneEncoding(blob) {
	Recorder.setupDownload(blob, "myRecording" + ((recIndex < 10) ? "0" : "") + recIndex + ".wav");
	recIndex++;
}

function toggleRecording(e) {
	if (e.classList.contains("recording")) {
		// stop recording
		audioRecorder.stop();
		e.classList.remove("recording");
		audioRecorder.getBuffers(gotBuffers);
	} else {
		// start recording
		if (!audioRecorder)
			return;
		e.classList.add("recording");
		audioRecorder.clear();
		audioRecorder.record();
	}
}

function convertToMono(input) {
	var splitter = audioContext.createChannelSplitter(2);
	var merger = audioContext.createChannelMerger(2);

	input.connect(splitter);
	splitter.connect(merger, 0, 0);
	splitter.connect(merger, 0, 1);
	return merger;
}

function cancelAnalyserUpdates() {
	window.cancelAnimationFrame(rafID);
	rafID = null;
}
function updateAnalysers(time) {
	if (!analyserContext) {
		var canvas = document.getElementById("canvas");
		canvasWidth = canvas.width;
		canvasHeight = canvas.height;
		analyserContext = canvas.getContext('2d');
	}

	// analyzer draw code here
	{
		var SPACING = 13;
		var BAR_WIDTH = 12;
		var numBars = Math.round(canvasWidth / SPACING);
		var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

		analyserNode.getByteFrequencyData(freqByteData);

		analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
		analyserContext.fillStyle = '#4CAF50';
		analyserContext.lineCap = 'butt';

		var multiplier = analyserNode.frequencyBinCount / numBars;

		var oneSumDb = 0;
		var oneCount = 0;
		// Draw rectangle for each frequency bin.
		for (var i = 0; i < numBars; ++i) {
			var magnitude = 0;
			var offset = Math.floor(i * multiplier);
			// gotta sum/average the block, or we miss narrow-bandwidth spikes
			for (var j = 0; j < multiplier; j++)
				magnitude += freqByteData[offset + j];
			magnitude = magnitude / multiplier;
			var magnitude2 = freqByteData[i * multiplier];
			//analyserContext.fillStyle = "hsl( " + Math.round((i*2)/numBars) + ", 100%, 50%)";
			
			if (magnitude >= 0) {
				oneSumDb += magnitude;
				oneCount += 1;
			}
						
			//draw
			analyserContext.fillStyle = "#4CAF50";
			analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude * 2);
			analyserContext.strokeStyle = '#4CAF50';
			analyserContext.strokeRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude * 2);

		}
		if(audioStateNum <= 1) {
			sumDb += (oneSumDb/oneCount);
			count += 1;
			console.log("sumDb:" + sumDb + "count:" + count);//test
		}
	}

	rafID = window.requestAnimationFrame(updateAnalysers);
}

function toggleMono() {
	if (audioInput != realAudioInput) {
		audioInput.disconnect();
		realAudioInput.disconnect();
		audioInput = realAudioInput;
	} else {
		realAudioInput.disconnect();
		audioInput = convertToMono(realAudioInput);
	}

	audioInput.connect(inputPoint);
}
function gotDecial(stream) {
	inputPoint = audioContext.createGain();

	// Create an AudioNode from the stream.
	realAudioInput = audioContext.createMediaStreamSource(stream);
	audioInput = realAudioInput;
	audioInput.connect(inputPoint);

	analyserNode = audioContext.createAnalyser();
	analyserNode.fftSize = 2048;
	inputPoint.connect(analyserNode);

	audioRecorder = new Recorder(inputPoint);

	zeroGain = audioContext.createGain();
	zeroGain.gain.value = 0.0;
	inputPoint.connect(zeroGain);
	zeroGain.connect(audioContext.destination);
	updateAnalysers();

}
function gotStream(stream) {
	inputPoint = audioContext.createGain();

	// Create an AudioNode from the stream.
	realAudioInput = audioContext.createMediaStreamSource(stream);
	audioInput = realAudioInput;
	audioInput.connect(inputPoint);


	analyserNode = audioContext.createAnalyser();
	analyserNode.fftSize = 2048;
	inputPoint.connect(analyserNode);

	audioRecorder = new Recorder(inputPoint);

	zeroGain = audioContext.createGain();
	//zeroGain.gain.value = 0.0;
	inputPoint.connect(zeroGain);
	zeroGain.connect(audioContext.destination);
	updateAnalysers();
}

function initAudio() {
	if (!navigator.getUserMedia)
		navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	if (!navigator.cancelAnimationFrame)
		navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
	if (!navigator.requestAnimationFrame)
		navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

	navigator.getUserMedia({
		audio: true
	}, gotDecial, function (e) {
		//alert('Error getting audio');
		Namespace.TesterTips("warnning", "Error getting audio")
		console.log(e);
	});
}


function exeAudio() {
	if (audioStateNum == 0) {
		topDb = 0;
		sumDb = 0;
		count = 0;
		audioStateNum = 1;
		initAudio();
	}
	else if(audioStateNum == 1) {
		topDb = Math.floor(sumDb/count);
		audioContext.suspend();
		sumDb = 0;
		count = 0;
		
		console.log("topDb:" + topDb);
		playmusic(topDb);
		document.getElementById("db_number").innerHTML = topDb;
		
		audioStateNum = 2;
	}
	else if (audioStateNum == 2){
		topDb = 0;
		sumDb = 0;
		count = 0;
		audioContext.resume();
		audioStateNum = 1;
	}
	else {
		
	}
}

//window.addEventListener('load', initAudio );