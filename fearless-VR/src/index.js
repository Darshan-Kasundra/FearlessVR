import * as THREE from 'three';
import { BasicButton } from './button.js'; // 66
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; //71

import { QuestionBox } from './question.js';
import { TimerBox } from './timer.js';
import { init } from './init.js';

import { io } from 'socket.io-client';

// Socket.IO setup
const socket = io();

// Speech recognition variables
let isRecording = false;
let mediaRecorder;
let audioChunks = [];

// Speech recognition functions
function startRecording() {
	if (isRecording) return;

	navigator.mediaDevices
		.getUserMedia({ audio: true })
		.then((stream) => {
			isRecording = true;
			mediaRecorder = new MediaRecorder(stream);
			audioChunks = [];

			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};

			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
				const formData = new FormData();
				formData.append('audio', audioBlob);

				try {
					const response = await fetch('/process-audio', {
						method: 'POST',
						body: formData,
					});

					if (response.ok) {
						const data = await response.json();
						const transcription = data.transcription;

						// Request a single question based on transcription
						socket.emit('get_question', { transcription });
					}
				} catch (error) {
					console.error('Error processing audio:', error);
				}
			};

			mediaRecorder.start();
			console.log('Recording started');
		})
		.catch((error) => {
			console.error('Error accessing microphone:', error);
		});
}

function stopRecording() {
	if (!isRecording) return;
	mediaRecorder.stop();
	isRecording = false;
	console.log('Recording stopped');
}

// Handle the received question from the server
socket.on('question_generated', (data) => {
	const question = data.question;

	// Send the question for text-to-speech
	socket.emit('text_to_speech', {
		text: question,
	});

	console.log('Generated Question:', question);

	// You can trigger avatar animations or visual feedback here
});

// Error handling for socket connection
socket.on('connect_error', (error) => {
	console.error('Socket.IO connection error:', error);
});

let timerBox, button, raycaster, rightController;

function setupScene({ scene, camera, renderer, player, controllers }) {
	const gltfLoader = new GLTFLoader();

	// Load the environment (lecture hall)
	gltfLoader.load('assets/lectureHall.glb', (gltf) => {
		const environment = gltf.scene;
		environment.scale.set(0.05, 0.05, 0.05);
		environment.position.set(0, 0, -10);
		environment.rotation.y = Math.PI;
		scene.add(environment);
	});
	// Add more environment setup here...
	//Center front
	gltfLoader.load('assets/Human V1 3D Model.glb', (gltf) => {
		const environment = gltf.scene;
		environment.scale.set(0.2, 0.2, 0.2);
		environment.position.set(0.12, -0.4, -3.15);
		scene.add(environment);
	});
	//Center right
	gltfLoader.load('assets/Human V1 3D Model.glb', (gltf) => {
		const environment = gltf.scene;
		environment.scale.set(0.2, 0.2, 0.2);
		environment.position.set(1, 0.2, -4.5);
		environment.rotation.y = Math.PI / 0.52;
		scene.add(environment);
	});
	//Center left
	gltfLoader.load('assets/Human V1 3D Model.glb', (gltf) => {
		const environment = gltf.scene;
		environment.scale.set(0.2, 0.2, 0.2);
		environment.position.set(-0.75, 0.2, -4.5);
		environment.rotation.y = -Math.PI / 0.51;
		scene.add(environment);
	});
	// Left
	gltfLoader.load('assets/Human V1 3D Model.glb', (gltf) => {
		const environment = gltf.scene;
		environment.scale.set(0.2, 0.2, 0.2);
		environment.position.set(-5, 0.2, -4.5);
		environment.rotation.y = -Math.PI / 0.56;
		scene.add(environment);
	});
	//Right
	gltfLoader.load('assets/Human V1 3D Model.glb', (gltf) => {
		const environment = gltf.scene;
		environment.scale.set(0.2, 0.2, 0.2);
		environment.position.set(5, 0.2, -4.5);
		environment.rotation.y = Math.PI / 0.56;
		scene.add(environment);
	});
	//Front left
	gltfLoader.load('assets/Human V1 3D Model.glb', (gltf) => {
		const environment = gltf.scene;
		environment.scale.set(0.2, 0.2, 0.2);
		environment.position.set(-1.75, -0.4, -3.15);
		environment.rotation.y = -Math.PI / 0.545;
		scene.add(environment);
	});
	//Front right
	gltfLoader.load('assets/Human V1 3D Model.glb', (gltf) => {
		const environment = gltf.scene;
		environment.scale.set(0.2, 0.2, 0.2);
		environment.position.set(1.75, -0.4, -3.15);
		environment.rotation.y = Math.PI / 0.545;
		scene.add(environment);
	});

	const questionBox = new QuestionBox(scene);
	scene.add(questionBox);

	timerBox = new TimerBox(scene);
	scene.add(timerBox);

	button = new BasicButton(scene, () => {
		console.log('Button clicked!');
	});

	scene.add(button);

	// Set up raycaster for VR interaction
	raycaster = new THREE.Raycaster();

	// Get the right controller
	rightController = renderer.xr.getController(0);
	scene.add(rightController);

	// Add a visible laser pointer for the controller
	const lineGeometry = new THREE.BufferGeometry().setFromPoints([
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, -1),
	]);
	const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
	const laserPointer = new THREE.Line(lineGeometry, lineMaterial);
	laserPointer.name = 'line';
	rightController.add(laserPointer);

	return { scene, renderer };
}

function onFrame(delta, time, { scene, camera, renderer }) {
	if (rightController) {
		const tempMatrix = new THREE.Matrix4();
		tempMatrix.identity().extractRotation(rightController.matrixWorld);

		raycaster.ray.origin.setFromMatrixPosition(rightController.matrixWorld);
		raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

		if (rightController.userData.selectPressed && button) {
			button.handleInteraction(raycaster);
		}
	}

	if (timerBox) {
		timerBox.update();
	}
}

window.VRSpeechInterface = {
	startRecording,
	stopRecording,
	playQuestionInVR: (questionText) => {
		socket.emit('text_to_speech', {
			text: questionText,
		});
	},
};

// Initialize the application
init(setupScene, onFrame);
