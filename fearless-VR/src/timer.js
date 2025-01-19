import * as THREE from 'three';

export class TimerBox {
	constructor(scene) {
		this.scene = scene;
		this.group = new THREE.Group();

		// Timer variables
		this.startTime = null;
		this.elapsedTime = 0;

		this.createTimerBox();
		this.scene.add(this.group);

		this.group.position.set(0, 0.7, -2);
		this.group.rotation.x = -0.2;

		// Start the timer 2 seconds after page load
		setTimeout(() => {
			this.startTime = performance.now();
		}, 2000);
	}

	createTimerBox() {
		// Create background panel
		const geometry = new THREE.BoxGeometry(0.95, 0.4, 0.1); // Smaller and thicker
		const material = new THREE.MeshPhongMaterial({
			color: 0x2c3e50,
			transparent: true,
			opacity: 0.9,
		});
		this.panel = new THREE.Mesh(geometry, material);

		// Create border for the panel
		const borderGeometry = new THREE.BoxGeometry(1, 0.45, 0.09); // Slightly larger than the panel
		const borderMaterial = new THREE.MeshPhongMaterial({
			color: 0x34495e,
		});
		this.border = new THREE.Mesh(borderGeometry, borderMaterial);

		// Add to group
		this.group.add(this.border);
		this.group.add(this.panel);

		// Create and display the initial timer text
		this.createText('Starting...');
	}

	createText(message) {
		// Create canvas for the text
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		canvas.width = 1024;
		canvas.height = 256;

		// Set up text style
		context.fillStyle = '#ffffff';
		context.font = 'bold 48px Arial';
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		// Draw the initial text
		context.fillText(message, canvas.width / 2, canvas.height / 2);

		// Create texture from canvas
		const texture = new THREE.CanvasTexture(canvas);
		const textMaterial = new THREE.MeshBasicMaterial({
			map: texture,
			transparent: true,
		});

		// Create text mesh
		const textGeometry = new THREE.PlaneGeometry(1.4, 0.3); // Smaller text area
		this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
		this.textMesh.position.z = 0.06; // Bring text slightly forward

		this.group.add(this.textMesh);
		this.canvas = canvas;
		this.context = context;
		this.texture = texture; // Save for updates
	}

	update() {
		// If the timer hasn't started yet, do nothing
		if (!this.startTime) return;

		// Calculate elapsed time
		const now = performance.now();
		this.elapsedTime = (now - this.startTime) / 1000; // Convert to seconds

		// Update the text on the canvas
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear previous text
		this.context.fillStyle = '#ffffff';
		this.context.font = 'bold 48px Arial';
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		this.context.fillText(
			`Time: ${this.elapsedTime.toFixed(1)}s`,
			this.canvas.width / 2,
			this.canvas.height / 2,
		);

		// Mark the texture for updates
		this.texture.needsUpdate = true;
	}
}
