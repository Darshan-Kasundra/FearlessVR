// import * as THREE from 'three';
// import { io } from 'socket.io-client';

// export class QuestionBox {
// 	constructor(scene) {
// 		this.scene = scene;
// 		this.group = new THREE.Group();

// 		// Use the existing Socket.IO connection
// 		//this.socket = io(); // Default connection from index.js

// 		// Request the first question
// 		// this.getFirstQuestion().then((question) => {
// 		// 	this.question = question || 'Default question';
// 		// 	console.log('Question to display:', this.question);

// 		// 	this.createChatBox(); // Create the box
// 		// 	this.scene.add(this.group); // Add to the scene
// 		// });
// 	}

// 	// async getFirstQuestion() {
// 	// 	return new Promise((resolve) => {
// 	// 		this.socket.on('question_generated', (data) => {
// 	// 			console.log('Data from server:', data);
// 	// 			resolve(data.question || null);
// 	// 		});

// 	// 		this.socket.emit('get_question', {
// 	// 			transcription: '',
// 	// 		});
// 	// 	});
// 	// }

// 	createChatBox() {
// 		// Debugging placeholder
// 		const debugCube = new THREE.Mesh(
// 			new THREE.BoxGeometry(0.5, 0.5, 0.5),
// 			new THREE.MeshBasicMaterial({ color: 0xff0000 }),
// 		);
// 		debugCube.position.set(0, 0, 0.1);
// 		this.group.add(debugCube); // Add cube for testing

// 		// Background panel
// 		const panelGeometry = new THREE.BoxGeometry(1.5, 0.4, 0.1);
// 		const panelMaterial = new THREE.MeshPhongMaterial({
// 			color: 0x2c3e50,
// 			transparent: true,
// 			opacity: 0.9,
// 		});
// 		this.panel = new THREE.Mesh(panelGeometry, panelMaterial);
// 		this.group.add(this.panel); // Add panel to group

// 		// Add text
// 		this.createText(this.question);
// 	}

// 	createText(message) {
// 		const canvas = document.createElement('canvas');
// 		const context = canvas.getContext('2d');
// 		canvas.width = 1024;
// 		canvas.height = 256;

// 		context.fillStyle = '#ffffff'; // White background for debugging
// 		context.fillRect(0, 0, canvas.width, canvas.height); // Fill canvas
// 		context.fillStyle = '#000000'; // Black text
// 		context.font = '48px Arial';
// 		context.textAlign = 'center';
// 		context.textBaseline = 'middle';
// 		context.fillText(message, canvas.width / 2, canvas.height / 2);

// 		const texture = new THREE.CanvasTexture(canvas);
// 		const textMaterial = new THREE.MeshBasicMaterial({ map: texture });
// 		const textGeometry = new THREE.PlaneGeometry(1.4, 0.3);
// 		this.textMesh = new THREE.Mesh(textGeometry, textMaterial);

// 		this.textMesh.position.z = 0.1;
// 		this.group.add(this.textMesh);
// 	}
// }

import * as THREE from 'three';
import { io } from 'socket.io-client';

export class QuestionBox {
	constructor(scene) {
		this.scene = scene;
		this.group = new THREE.Group();

		// Connect to the Socket.IO server
		this.socket = io('http://127.0.0.1:5000', {
			transports: ['websocket', 'polling'],
		  });
		   // Use the correct backend URL

		// Request the first question
		this.getFirstQuestion().then((question) => {
			this.question = question || 'Default question';
			console.log('Question to display:', this.question);

			this.createChatBox();
			this.scene.add(this.group);
		});

		// Position the chat box
		this.group.position.set(0, 2.5, -1.3);
		this.group.rotation.x = 0.3;
	}

	async getFirstQuestion() {
		return new Promise((resolve) => {
			this.socket.on('question_generated', (data) => {
				console.log('Data from server:', data);
				resolve(data.question || null);
			});

			this.socket.emit('get_question', { transcription: '' });
		});
	}

	createChatBox() {
		// Create background panel
		const geometry = new THREE.BoxGeometry(3, 0.9, 0.1);
		const material = new THREE.MeshPhongMaterial({
			color: 0x2c3e50,
			transparent: true,
			opacity: 0.9,
		});
		this.panel = new THREE.Mesh(geometry, material);

		// Create border
		const borderGeometry = new THREE.BoxGeometry(3.05, 0.95, 0.09);
		const borderMaterial = new THREE.MeshPhongMaterial({ color: 0x34495e });
		this.border = new THREE.Mesh(borderGeometry, borderMaterial);

		// Add to group
		this.group.add(this.border);
		this.group.add(this.panel);

		// Add text
		this.createText(this.question);
	}

	createText(message) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 1024;
        canvas.height = 512; // Increased height for multiple lines

        context.fillStyle = '#ffffff';
        context.font = 'bold 48px Arial';
        
        // Text wrapping configuration
        const maxWidth = 900; // Maximum width for text wrapping
        const lineHeight = 60; // Height between lines

        // Function to wrap text
        function wrapText(context, text, maxWidth) {
            const words = text.split(' ');
            const lines = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const width = context.measureText(currentLine + ' ' + word).width;
                
                if (width < maxWidth) {
                    currentLine += ' ' + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);
            return lines;
        }

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw wrapped text
        const lines = wrapText(context, message, maxWidth);
        const totalHeight = lines.length * lineHeight;
        const startY = (canvas.height - totalHeight) / 2;

        context.textAlign = 'center';
        context.textBaseline = 'middle';

        lines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            context.fillText(line, canvas.width / 2, y);
        });

        const texture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
        });

        // Adjust text plane geometry to match new panel size
        const textGeometry = new THREE.PlaneGeometry(2.4, 1.1);
        this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
        this.textMesh.position.z = 0.06;

        this.group.add(this.textMesh);
    }	
}
