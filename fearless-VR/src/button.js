import * as THREE from 'three';

export class BasicButton {
    constructor(scene, onClick) {
        this.scene = scene;
        this.onClick = onClick;

        this.createButton();
    }

    createButton() {
        // Create a simple box geometry as the button
        const geometry = new THREE.BoxGeometry(0.3, 0.1, 0.05);
        const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
        this.button = new THREE.Mesh(geometry, material);

        // Position the button in front of the user
        this.button.position.set(0, 1.5, -0.5);

        // Add the button to the scene
        this.scene.add(this.button);

        // Enable the button to receive raycaster input
        this.button.userData.isButton = true;
    }

    handleInteraction(raycaster) {
        // Check if the raycaster intersects with the button
        const intersects = raycaster.intersectObject(this.button);
        if (intersects.length > 0) {
            // Call the onClick callback when the button is clicked
            this.onClick();
            console.log('Button clicked from button.js');
        }
    }
}