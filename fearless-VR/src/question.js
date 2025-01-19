import * as THREE from 'three';
import { io } from 'socket.io-client';

export class QuestionBox {
	constructor(scene) {
		this.scene = scene;
		this.group = new THREE.Group();

		// Use the existing Socket.IO connection
		this.socket = io(); // Default connection from index.js

		// Request the first question
		this.getFirstQuestion().then((question) => {
			this.question = question || 'Default question';
			console.log('Question to display:', this.question);

			this.createChatBox(); // Create the box
			this.scene.add(this.group); // Add to the scene
		});
	}

	async getFirstQuestion() {
		return new Promise((resolve) => {
			this.socket.on('question_generated', (data) => {
				console.log('Data from server:', data);
				resolve(data.question || null);
			});

			this.socket.emit('get_question', {
				transcription: '',
			});
		});
	}

	createChatBox() {
		// Debugging placeholder
		const debugCube = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 0.5, 0.5),
			new THREE.MeshBasicMaterial({ color: 0xff0000 }),
		);
		debugCube.position.set(0, 0, 0.1);
		this.group.add(debugCube); // Add cube for testing

		// Background panel
		const panelGeometry = new THREE.BoxGeometry(1.5, 0.4, 0.1);
		const panelMaterial = new THREE.MeshPhongMaterial({
			color: 0x2c3e50,
			transparent: true,
			opacity: 0.9,
		});
		this.panel = new THREE.Mesh(panelGeometry, panelMaterial);
		this.group.add(this.panel); // Add panel to group

		// Add text
		this.createText(this.question);
	}

	createText(message) {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		canvas.width = 1024;
		canvas.height = 256;

		context.fillStyle = '#ffffff'; // White background for debugging
		context.fillRect(0, 0, canvas.width, canvas.height); // Fill canvas
		context.fillStyle = '#000000'; // Black text
		context.font = '48px Arial';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(message, canvas.width / 2, canvas.height / 2);

		const texture = new THREE.CanvasTexture(canvas);
		const textMaterial = new THREE.MeshBasicMaterial({ map: texture });
		const textGeometry = new THREE.PlaneGeometry(1.4, 0.3);
		this.textMesh = new THREE.Mesh(textGeometry, textMaterial);

		this.textMesh.position.z = 0.1;
		this.group.add(this.textMesh);
	}
}
