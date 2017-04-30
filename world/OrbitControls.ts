import * as THREE from "three";
/**
 * @author Kyle H / http://kylehughes.co.uk
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */
// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finger swipe

const enum OrbitControlsKey {
    Left = 37, Up = 38, Right = 39, Bottom = 40,
}
const enum OrbitControlsState {
    None = -1,
    Rotate = 0,
    Dolly = 1,
    Pan = 2,
    TouchRotate = 3,
    TouchDolly = 4,
    TouchPan = 5,
}
export class OrbitControls extends THREE.EventDispatcher {
    private static EPS = 0.000001;

    public domElement: HTMLElement;
    public enabled = true;
    public target = new THREE.Vector3();
    // How far you can dolly in and out ( PerspectiveCamera only )
    public minDistance = 0;
    public maxDistance = Infinity;
    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    public minPolarAngle = 0; // radians
    public maxPolarAngle = Math.PI; // radians
    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    public minAzimuthAngle = -Infinity; // radians
    public maxAzimuthAngle = Infinity; // radians
    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    public enableDamping = false;
    public dampingFactor = 0.25;
    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    public enableZoom = true;
    public zoomSpeed = 1.0;
    // Set to false to disable rotating
    public enableRotate = true;
    public rotateSpeed = 1.0;
    // Set to false to disable panning
    public enablePan = true;
    public keyPanSpeed = 7.0; // pixels moved per arrow key push
    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    public autoRotate = false;
    public autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
    // Set to false to disable use of the keys
    public enableKeys = true;
    // Mouse buttons
    public readonly mouseButtons = {
        Orbit: THREE.MOUSE.LEFT,
        Pan: THREE.MOUSE.RIGHT,
        Zoom: THREE.MOUSE.MIDDLE,
    };

    private readonly resets = {
        position: new THREE.Vector3(),
        target: new THREE.Vector3(),
    };

    private spherical = new THREE.Spherical();
    private sphericalDelta = new THREE.Spherical();

    private state = OrbitControlsState.None;

    private changeEvent = {
        type: "change",
    };
    private startEvent = {
        type: "start",
    };
    private endEvent = {
        type: "end",
    };

    private scale = 1;
    private panOffset = new THREE.Vector3();
    private zoomChanged = false;
    private rotateStart = new THREE.Vector2();
    private rotateEnd = new THREE.Vector2();
    private rotateDelta = new THREE.Vector2();
    private panStart = new THREE.Vector2();
    private panEnd = new THREE.Vector2();
    private panDelta = new THREE.Vector2();
    private dollyStart = new THREE.Vector2();
    private dollyEnd = new THREE.Vector2();
    private dollyDelta = new THREE.Vector2();

    constructor(public readonly object: THREE.PerspectiveCamera, _domElement: HTMLElement | Document = document) {
        super();
        this.domElement = this.makeDomElement(_domElement);
        this.resets.target = this.target.clone();
        this.resets.position = this.object.position.clone();
        this.domElement.addEventListener("contextmenu", this.onContextMenu.bind(this), false);
        this.domElement.addEventListener("mousedown", this.onMouseDown.bind(this), false);
        this.domElement.addEventListener("wheel", this.onMouseWheel.bind(this), false);
        this.domElement.addEventListener("touchstart", this.onTouchStart.bind(this), false);
        this.domElement.addEventListener("touchend", this.onTouchEnd.bind(this), false);
        this.domElement.addEventListener("touchmove", this.onTouchMove.bind(this), false);
        window.addEventListener("keydown", this.onKeyDown.bind(this), false);

        // force an update at start
        this.update();
    }

    public dispose() {
        this.domElement.removeEventListener("contextmenu", this.onContextMenu.bind(this), false);
        this.domElement.removeEventListener("mousedown", this.onMouseDown.bind(this), false);
        this.domElement.removeEventListener("wheel", this.onMouseWheel.bind(this), false);
        this.domElement.removeEventListener("touchstart", this.onTouchStart.bind(this), false);
        this.domElement.removeEventListener("touchend", this.onTouchEnd.bind(this), false);
        this.domElement.removeEventListener("touchmove", this.onTouchMove.bind(this), false);
        document.removeEventListener("mousemove", this.onMouseMove.bind(this), false);
        document.removeEventListener("mouseup", this.onMouseUp.bind(this), false);
        window.removeEventListener("keydown", this.onKeyDown.bind(this), false);
    }

    public reset() {
        this.target.copy(this.resets.target);
        this.object.position.copy(this.resets.position);
        this.object.updateProjectionMatrix();
        this.dispatchEvent(this.changeEvent);
        this.update();
        this.state = OrbitControlsState.None;
    }
    private makeDomElement(element: HTMLElement | Document): HTMLElement {
        if (element instanceof Document) {
            return element.body;
        } else
            return element;
    }

    private getPolarAngle() {
        return this.spherical.phi;
    }
    private getAzimuthalAngle() {
        return this.spherical.theta;
    }

    private update() {
        const offset = new THREE.Vector3();
        // so camera.up is the orbit axis
        const quat = new THREE.Quaternion().setFromUnitVectors(this.object.up, new THREE.Vector3(0, 1, 0));
        const quatInverse = quat.clone().inverse();
        const lastPosition = new THREE.Vector3();
        const lastQuaternion = new THREE.Quaternion();

        const position = this.object.position;
        offset.copy(position).sub(this.target);
        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat);
        // angle from z-axis around y-axis
        this.spherical.setFromVector3(offset);
        if (this.autoRotate && this.state === OrbitControlsState.None) {
            this.rotateLeft(this.getAutoRotationAngle());
        }
        this.spherical.theta += this.sphericalDelta.theta;
        this.spherical.phi += this.sphericalDelta.phi;
        // restrict theta to be between desired limits
        this.spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.spherical.theta));
        // restrict phi to be between desired limits
        this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));

        this.spherical.makeSafe();

        this.spherical.radius *= this.scale;
        // restrict radius to be between desired limits
        this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
        // move target to panned location
        this.target.add(this.panOffset);
        offset.setFromSpherical(this.spherical);
        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse);
        position.copy(this.target).add(offset);
        this.object.lookAt(this.target);
        if (this.enableDamping === true) {
            this.sphericalDelta.theta *= (1 - this.dampingFactor);
            this.sphericalDelta.phi *= (1 - this.dampingFactor);
        } else {
            this.sphericalDelta.set(0, 0, 0);
        }
        this.scale = 1;
        this.panOffset.set(0, 0, 0);
        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8
        if (this.zoomChanged ||
            lastPosition.distanceToSquared(this.object.position) > OrbitControls.EPS ||
            8 * (1 - lastQuaternion.dot(this.object.quaternion)) > OrbitControls.EPS) {
            this.dispatchEvent(this.changeEvent);
            lastPosition.copy(this.object.position);
            lastQuaternion.copy(this.object.quaternion);
            this.zoomChanged = false;
        }
    }

    private getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
    }

    private getZoomScale() {
        return Math.pow(0.95, this.zoomSpeed);
    }

    private rotateLeft(angle) {
        this.sphericalDelta.theta -= angle;
    }

    private rotateUp(angle) {
        this.sphericalDelta.phi -= angle;
    }
    private panLeft(distance, objectMatrix) {
        const v = new THREE.Vector3();
        v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
        v.multiplyScalar(-distance);
        this.panOffset.add(v);
    }
    private panUp(distance, objectMatrix) {
        const v = new THREE.Vector3();
        v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
        v.multiplyScalar(distance);
        this.panOffset.add(v);
    }
    // deltaX and deltaY are in pixels; right and down are positive
    private pan(deltaX, deltaY) {
        const offset = new THREE.Vector3();
        if (this.object instanceof THREE.PerspectiveCamera) {
            // perspective
            const position = this.object.position;
            offset.copy(position).sub(this.target);
            let targetDistance = offset.length();
            // half of the fov is center to top of screen
            targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);
            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            this.panLeft(2 * deltaX * targetDistance / this.domElement.clientHeight, this.object.matrix);
            this.panUp(2 * deltaY * targetDistance / this.domElement.clientHeight, this.object.matrix);
        } else {
            console.warn("WARNING: OrbitControls.ts was made for PerspectiveCamera only. Not sure why, it just was.");
            this.enablePan = false;
        }
    }

    private dollyIn(dollyScale) {
        if (this.object instanceof THREE.PerspectiveCamera) {
            this.scale /= dollyScale;
        } else {
            console.warn("WARNING: OrbitControls.ts was made for PerspectiveCamera only. Not sure why, it just was.");
            this.enableZoom = false;
        }
    }

    private dollyOut(dollyScale) {
        if (this.object instanceof THREE.PerspectiveCamera) {
            this.scale *= dollyScale;
        } else {
            console.warn("WARNING: OrbitControls.ts was made for PerspectiveCamera only. Not sure why, it just was.");
            this.enableZoom = false;
        }
    }
    //
    // event callbacks - update the object state
    //
    private handleMouseDownRotate(event) {
        this.rotateStart.set(event.clientX, event.clientY);
    }

    private handleMouseDownDolly(event) {
        this.dollyStart.set(event.clientX, event.clientY);
    }

    private handleMouseDownPan(event) {
        this.panStart.set(event.clientX, event.clientY);
    }

    private handleMouseMoveRotate(event) {
        this.rotateEnd.set(event.clientX, event.clientY);
        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
        // rotating across whole screen goes 360 degrees around
        this.rotateLeft(2 * Math.PI * this.rotateDelta.x / this.domElement.clientWidth * this.rotateSpeed);
        // rotating up and down along whole screen attempts to go 360, but limited to 180
        this.rotateUp(2 * Math.PI * this.rotateDelta.y / this.domElement.clientHeight * this.rotateSpeed);
        this.rotateStart.copy(this.rotateEnd);
        this.update();
    }

    private handleMouseMoveDolly(event: MouseEvent) {
        this.dollyEnd.set(event.clientX, event.clientY);
        this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);
        if (this.dollyDelta.y > 0) {
            this.dollyIn(this.getZoomScale());
        } else if (this.dollyDelta.y < 0) {
            this.dollyOut(this.getZoomScale());
        }
        this.dollyStart.copy(this.dollyEnd);
        this.update();
    }

    private handleMouseMovePan(event) {
        this.panEnd.set(event.clientX, event.clientY);
        this.panDelta.subVectors(this.panEnd, this.panStart);
        this.pan(this.panDelta.x, this.panDelta.y);
        this.panStart.copy(this.panEnd);
        this.update();
    }

    private handleMouseWheel(event) {
        if (event.deltaY < 0) {
            this.dollyOut(this.getZoomScale());
        } else if (event.deltaY > 0) {
            this.dollyIn(this.getZoomScale());
        }
        this.update();
    }

    private handleTouchStartRotate(event) {
        this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
    }

    private handleTouchStartDolly(event) {
        const dx = event.touches[0].pageX - event.touches[1].pageX;
        const dy = event.touches[0].pageY - event.touches[1].pageY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.dollyStart.set(0, distance);
    }

    private handleTouchStartPan(event) {
        this.panStart.set(event.touches[0].pageX, event.touches[0].pageY);
    }

    private handleTouchMoveRotate(event) {
        this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
        // rotating across whole screen goes 360 degrees around
        this.rotateLeft(2 * Math.PI * this.rotateDelta.x / this.domElement.clientWidth * this.rotateSpeed);
        // rotating up and down along whole screen attempts to go 360, but limited to 180
        this.rotateUp(2 * Math.PI * this.rotateDelta.y / this.domElement.clientHeight * this.rotateSpeed);
        this.rotateStart.copy(this.rotateEnd);
        this.update();
    }

    private handleTouchMoveDolly(event) {
        const dx = event.touches[0].pageX - event.touches[1].pageX;
        const dy = event.touches[0].pageY - event.touches[1].pageY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.dollyEnd.set(0, distance);
        this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);
        if (this.dollyDelta.y > 0) {
            this.dollyOut(this.getZoomScale());
        } else if (this.dollyDelta.y < 0) {
            this.dollyIn(this.getZoomScale());
        }
        this.dollyStart.copy(this.dollyEnd);
        this.update();
    }

    private handleTouchMovePan(event) {
        this.panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        this.panDelta.subVectors(this.panEnd, this.panStart);
        this.pan(this.panDelta.x, this.panDelta.y);
        this.panStart.copy(this.panEnd);
        this.update();
    }

    //
    // event handlers - FSM: listen for events and reset state
    //
    private onMouseDown(event) {
        if (this.enabled === false) return;
        event.preventDefault();
        if (event.button === this.mouseButtons.Orbit) {
            if (this.enableRotate === false) return;
            this.handleMouseDownRotate(event);
            this.state = OrbitControlsState.Rotate;
        } else if (event.button === this.mouseButtons.Zoom) {
            if (this.enableZoom === false) return;
            this.handleMouseDownDolly(event);
            this.state = OrbitControlsState.Dolly;
        } else if (event.button === this.mouseButtons.Pan) {
            if (this.enablePan === false) return;
            this.handleMouseDownPan(event);
            this.state = OrbitControlsState.Pan;
        }
        if (this.state !== OrbitControlsState.None) {
            document.addEventListener("mousemove", this.onMouseMove.bind(this), false);
            document.addEventListener("mouseup", this.onMouseUp.bind(this), false);
            this.dispatchEvent(this.startEvent);
        }
    }

    private onMouseMove(event) {
        if (this.enabled === false) return;
        event.preventDefault();
        if (this.state === OrbitControlsState.Rotate) {
            if (this.enableRotate === false) return;
            this.handleMouseMoveRotate(event);
        } else if (this.state === OrbitControlsState.Dolly) {
            if (this.enableZoom === false) return;
            this.handleMouseMoveDolly(event);
        } else if (this.state === OrbitControlsState.Pan) {
            if (this.enablePan === false) return;
            this.handleMouseMovePan(event);
        }
    }

    private onMouseUp(event) {
        if (this.enabled === false) return;
        document.removeEventListener("mousemove", this.onMouseMove.bind(this), false);
        document.removeEventListener("mouseup", this.onMouseUp.bind(this), false);
        this.dispatchEvent(this.endEvent);
        this.state = OrbitControlsState.None;
    }

    private onMouseWheel(event) {
        if (this.enabled === false || this.enableZoom === false ||
            (this.state !== OrbitControlsState.None && this.state !== OrbitControlsState.Rotate)) return;
        event.preventDefault();
        event.stopPropagation();
        this.handleMouseWheel(event);
        this.dispatchEvent(this.startEvent); // not sure why these are here...
        this.dispatchEvent(this.endEvent);
    }

    private onKeyDown(event) {
        if (this.enabled === false || this.enableKeys === false || this.enablePan === false) return;
        switch (event.keyCode) {
            case OrbitControlsKey.Up:
                this.pan(0, this.keyPanSpeed);
                this.update();
                break;
            case OrbitControlsKey.Bottom:
                this.pan(0, -this.keyPanSpeed);
                this.update();
                break;
            case OrbitControlsKey.Left:
                this.pan(this.keyPanSpeed, 0);
                this.update();
                break;
            case OrbitControlsKey.Right:
                this.pan(-this.keyPanSpeed, 0);
                this.update();
                break;
        }
    }

    private onTouchStart(event) {
        if (this.enabled === false) return;
        switch (event.touches.length) {
            case 1: // one-fingered touch: rotate
                if (this.enableRotate === false) return;
                this.handleTouchStartRotate(event);
                this.state = OrbitControlsState.TouchRotate;
                break;
            case 2: // two-fingered touch: dolly
                if (this.enableZoom === false) return;
                this.handleTouchStartDolly(event);
                this.state = OrbitControlsState.TouchDolly;
                break;
            case 3: // three-fingered touch: pan
                if (this.enablePan === false) return;
                this.handleTouchStartPan(event);
                this.state = OrbitControlsState.TouchPan;
                break;
            default:
                this.state = OrbitControlsState.None;
        }
        if (this.state !== OrbitControlsState.None) {
            this.dispatchEvent(this.startEvent);
        }
    }

    private onTouchMove(event) {
        if (this.enabled === false) return;
        event.preventDefault();
        event.stopPropagation();
        switch (event.touches.length) {
            case 1: // one-fingered touch: rotate
                if (this.enableRotate === false) return;
                if (this.state !== OrbitControlsState.TouchRotate) return; // is this needed?...
                this.handleTouchMoveRotate(event);
                break;
            case 2: // two-fingered touch: dolly
                if (this.enableZoom === false) return;
                if (this.state !== OrbitControlsState.TouchDolly) return; // is this needed?...
                this.handleTouchMoveDolly(event);
                break;
            case 3: // three-fingered touch: pan
                if (this.enablePan === false) return;
                if (this.state !== OrbitControlsState.TouchPan) return; // is this needed?...
                this.handleTouchMovePan(event);
                break;
            default:
                this.state = OrbitControlsState.None;
        }
    }

    private onTouchEnd(event) {
        if (this.enabled === false) return;
        this.dispatchEvent(this.endEvent);
        this.state = OrbitControlsState.None;
    }

    private onContextMenu(event) {
        event.preventDefault();
    }
}
