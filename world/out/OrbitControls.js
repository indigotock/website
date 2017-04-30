System.register(["three"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var THREE, OrbitControls;
    return {
        setters: [
            function (THREE_1) {
                THREE = THREE_1;
            }
        ],
        execute: function () {
            OrbitControls = class OrbitControls extends THREE.EventDispatcher {
                constructor(object, _domElement = document) {
                    super();
                    this.object = object;
                    this.enabled = true;
                    this.target = new THREE.Vector3();
                    this.minDistance = 0;
                    this.maxDistance = Infinity;
                    this.minPolarAngle = 0;
                    this.maxPolarAngle = Math.PI;
                    this.minAzimuthAngle = -Infinity;
                    this.maxAzimuthAngle = Infinity;
                    this.enableDamping = false;
                    this.dampingFactor = 0.25;
                    this.enableZoom = true;
                    this.zoomSpeed = 1.0;
                    this.enableRotate = true;
                    this.rotateSpeed = 1.0;
                    this.enablePan = true;
                    this.keyPanSpeed = 7.0;
                    this.autoRotate = false;
                    this.autoRotateSpeed = 2.0;
                    this.enableKeys = true;
                    this.mouseButtons = {
                        Orbit: THREE.MOUSE.LEFT,
                        Zoom: THREE.MOUSE.MIDDLE,
                        Pan: THREE.MOUSE.RIGHT
                    };
                    this.resets = {
                        target: new THREE.Vector3(),
                        position: new THREE.Vector3()
                    };
                    this.spherical = new THREE.Spherical();
                    this.sphericalDelta = new THREE.Spherical();
                    this.state = -1;
                    this.changeEvent = {
                        type: 'change'
                    };
                    this.startEvent = {
                        type: 'start'
                    };
                    this.endEvent = {
                        type: 'end'
                    };
                    this.scale = 1;
                    this.panOffset = new THREE.Vector3();
                    this.zoomChanged = false;
                    this.rotateStart = new THREE.Vector2();
                    this.rotateEnd = new THREE.Vector2();
                    this.rotateDelta = new THREE.Vector2();
                    this.panStart = new THREE.Vector2();
                    this.panEnd = new THREE.Vector2();
                    this.panDelta = new THREE.Vector2();
                    this.dollyStart = new THREE.Vector2();
                    this.dollyEnd = new THREE.Vector2();
                    this.dollyDelta = new THREE.Vector2();
                    this.domElement = this.makeDomElement(_domElement);
                    this.resets.target = this.target.clone();
                    this.resets.position = this.object.position.clone();
                    this.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this), false);
                    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
                    this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this), false);
                    this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
                    this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this), false);
                    this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this), false);
                    window.addEventListener('keydown', this.onKeyDown.bind(this), false);
                    this.update();
                }
                makeDomElement(element) {
                    if (element instanceof Document) {
                        return element.body;
                    }
                    else
                        return element;
                }
                getPolarAngle() {
                    return this.spherical.phi;
                }
                getAzimuthalAngle() {
                    return this.spherical.theta;
                }
                reset() {
                    this.target.copy(this.resets.target);
                    this.object.position.copy(this.resets.position);
                    this.object.updateProjectionMatrix();
                    this.dispatchEvent(this.changeEvent);
                    this.update();
                    this.state = -1;
                }
                update() {
                    var offset = new THREE.Vector3();
                    var quat = new THREE.Quaternion().setFromUnitVectors(this.object.up, new THREE.Vector3(0, 1, 0));
                    var quatInverse = quat.clone().inverse();
                    var lastPosition = new THREE.Vector3();
                    var lastQuaternion = new THREE.Quaternion();
                    var position = this.object.position;
                    offset.copy(position).sub(this.target);
                    offset.applyQuaternion(quat);
                    this.spherical.setFromVector3(offset);
                    if (this.autoRotate && this.state === -1) {
                        this.rotateLeft(this.getAutoRotationAngle());
                    }
                    this.spherical.theta += this.sphericalDelta.theta;
                    this.spherical.phi += this.sphericalDelta.phi;
                    this.spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.spherical.theta));
                    this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));
                    this.spherical.makeSafe();
                    this.spherical.radius *= this.scale;
                    this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
                    this.target.add(this.panOffset);
                    offset.setFromSpherical(this.spherical);
                    offset.applyQuaternion(quatInverse);
                    position.copy(this.target).add(offset);
                    this.object.lookAt(this.target);
                    if (this.enableDamping === true) {
                        this.sphericalDelta.theta *= (1 - this.dampingFactor);
                        this.sphericalDelta.phi *= (1 - this.dampingFactor);
                    }
                    else {
                        this.sphericalDelta.set(0, 0, 0);
                    }
                    this.scale = 1;
                    this.panOffset.set(0, 0, 0);
                    if (this.zoomChanged ||
                        lastPosition.distanceToSquared(this.object.position) > OrbitControls.EPS ||
                        8 * (1 - lastQuaternion.dot(this.object.quaternion)) > OrbitControls.EPS) {
                        this.dispatchEvent(this.changeEvent);
                        lastPosition.copy(this.object.position);
                        lastQuaternion.copy(this.object.quaternion);
                        this.zoomChanged = false;
                    }
                }
                dispose() {
                    this.domElement.removeEventListener('contextmenu', this.onContextMenu.bind(this), false);
                    this.domElement.removeEventListener('mousedown', this.onMouseDown.bind(this), false);
                    this.domElement.removeEventListener('wheel', this.onMouseWheel.bind(this), false);
                    this.domElement.removeEventListener('touchstart', this.onTouchStart.bind(this), false);
                    this.domElement.removeEventListener('touchend', this.onTouchEnd.bind(this), false);
                    this.domElement.removeEventListener('touchmove', this.onTouchMove.bind(this), false);
                    document.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
                    document.removeEventListener('mouseup', this.onMouseUp.bind(this), false);
                    window.removeEventListener('keydown', this.onKeyDown.bind(this), false);
                }
                getAutoRotationAngle() {
                    return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
                }
                getZoomScale() {
                    return Math.pow(0.95, this.zoomSpeed);
                }
                rotateLeft(angle) {
                    this.sphericalDelta.theta -= angle;
                }
                rotateUp(angle) {
                    this.sphericalDelta.phi -= angle;
                }
                panLeft(distance, objectMatrix) {
                    var v = new THREE.Vector3();
                    v.setFromMatrixColumn(objectMatrix, 0);
                    v.multiplyScalar(-distance);
                    this.panOffset.add(v);
                }
                panUp(distance, objectMatrix) {
                    var v = new THREE.Vector3();
                    v.setFromMatrixColumn(objectMatrix, 1);
                    v.multiplyScalar(distance);
                    this.panOffset.add(v);
                }
                pan(deltaX, deltaY) {
                    var offset = new THREE.Vector3();
                    if (this.object instanceof THREE.PerspectiveCamera) {
                        var position = this.object.position;
                        offset.copy(position).sub(this.target);
                        var targetDistance = offset.length();
                        targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);
                        this.panLeft(2 * deltaX * targetDistance / this.domElement.clientHeight, this.object.matrix);
                        this.panUp(2 * deltaY * targetDistance / this.domElement.clientHeight, this.object.matrix);
                    }
                    else {
                        console.warn('WARNING: OrbitControls.ts was made for PerspectiveCamera only. Not sure why, it just was.');
                        this.enablePan = false;
                    }
                }
                dollyIn(dollyScale) {
                    if (this.object instanceof THREE.PerspectiveCamera) {
                        this.scale /= dollyScale;
                    }
                    else {
                        console.warn('WARNING: OrbitControls.ts was made for PerspectiveCamera only. Not sure why, it just was.');
                        this.enableZoom = false;
                    }
                }
                dollyOut(dollyScale) {
                    if (this.object instanceof THREE.PerspectiveCamera) {
                        this.scale *= dollyScale;
                    }
                    else {
                        console.warn('WARNING: OrbitControls.ts was made for PerspectiveCamera only. Not sure why, it just was.');
                        this.enableZoom = false;
                    }
                }
                handleMouseDownRotate(event) {
                    this.rotateStart.set(event.clientX, event.clientY);
                }
                handleMouseDownDolly(event) {
                    this.dollyStart.set(event.clientX, event.clientY);
                }
                handleMouseDownPan(event) {
                    this.panStart.set(event.clientX, event.clientY);
                }
                handleMouseMoveRotate(event) {
                    this.rotateEnd.set(event.clientX, event.clientY);
                    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
                    this.rotateLeft(2 * Math.PI * this.rotateDelta.x / this.domElement.clientWidth * this.rotateSpeed);
                    this.rotateUp(2 * Math.PI * this.rotateDelta.y / this.domElement.clientHeight * this.rotateSpeed);
                    this.rotateStart.copy(this.rotateEnd);
                    this.update();
                }
                handleMouseMoveDolly(event) {
                    this.dollyEnd.set(event.clientX, event.clientY);
                    this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);
                    if (this.dollyDelta.y > 0) {
                        this.dollyIn(this.getZoomScale());
                    }
                    else if (this.dollyDelta.y < 0) {
                        this.dollyOut(this.getZoomScale());
                    }
                    this.dollyStart.copy(this.dollyEnd);
                    this.update();
                }
                handleMouseMovePan(event) {
                    this.panEnd.set(event.clientX, event.clientY);
                    this.panDelta.subVectors(this.panEnd, this.panStart);
                    this.pan(this.panDelta.x, this.panDelta.y);
                    this.panStart.copy(this.panEnd);
                    this.update();
                }
                handleMouseWheel(event) {
                    if (event.deltaY < 0) {
                        this.dollyOut(this.getZoomScale());
                    }
                    else if (event.deltaY > 0) {
                        this.dollyIn(this.getZoomScale());
                    }
                    this.update();
                }
                handleTouchStartRotate(event) {
                    this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                }
                handleTouchStartDolly(event) {
                    var dx = event.touches[0].pageX - event.touches[1].pageX;
                    var dy = event.touches[0].pageY - event.touches[1].pageY;
                    var distance = Math.sqrt(dx * dx + dy * dy);
                    this.dollyStart.set(0, distance);
                }
                handleTouchStartPan(event) {
                    this.panStart.set(event.touches[0].pageX, event.touches[0].pageY);
                }
                handleTouchMoveRotate(event) {
                    this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
                    this.rotateLeft(2 * Math.PI * this.rotateDelta.x / this.domElement.clientWidth * this.rotateSpeed);
                    this.rotateUp(2 * Math.PI * this.rotateDelta.y / this.domElement.clientHeight * this.rotateSpeed);
                    this.rotateStart.copy(this.rotateEnd);
                    this.update();
                }
                handleTouchMoveDolly(event) {
                    var dx = event.touches[0].pageX - event.touches[1].pageX;
                    var dy = event.touches[0].pageY - event.touches[1].pageY;
                    var distance = Math.sqrt(dx * dx + dy * dy);
                    this.dollyEnd.set(0, distance);
                    this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);
                    if (this.dollyDelta.y > 0) {
                        this.dollyOut(this.getZoomScale());
                    }
                    else if (this.dollyDelta.y < 0) {
                        this.dollyIn(this.getZoomScale());
                    }
                    this.dollyStart.copy(this.dollyEnd);
                    this.update();
                }
                handleTouchMovePan(event) {
                    this.panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                    this.panDelta.subVectors(this.panEnd, this.panStart);
                    this.pan(this.panDelta.x, this.panDelta.y);
                    this.panStart.copy(this.panEnd);
                    this.update();
                }
                onMouseDown(event) {
                    if (this.enabled === false)
                        return;
                    event.preventDefault();
                    if (event.button === this.mouseButtons.Orbit) {
                        if (this.enableRotate === false)
                            return;
                        this.handleMouseDownRotate(event);
                        this.state = 0;
                    }
                    else if (event.button === this.mouseButtons.Zoom) {
                        if (this.enableZoom === false)
                            return;
                        this.handleMouseDownDolly(event);
                        this.state = 1;
                    }
                    else if (event.button === this.mouseButtons.Pan) {
                        if (this.enablePan === false)
                            return;
                        this.handleMouseDownPan(event);
                        this.state = 2;
                    }
                    if (this.state !== -1) {
                        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
                        document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
                        this.dispatchEvent(this.startEvent);
                    }
                }
                onMouseMove(event) {
                    if (this.enabled === false)
                        return;
                    event.preventDefault();
                    if (this.state === 0) {
                        if (this.enableRotate === false)
                            return;
                        this.handleMouseMoveRotate(event);
                    }
                    else if (this.state === 1) {
                        if (this.enableZoom === false)
                            return;
                        this.handleMouseMoveDolly(event);
                    }
                    else if (this.state === 2) {
                        if (this.enablePan === false)
                            return;
                        this.handleMouseMovePan(event);
                    }
                }
                onMouseUp(event) {
                    if (this.enabled === false)
                        return;
                    document.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
                    document.removeEventListener('mouseup', this.onMouseUp.bind(this), false);
                    this.dispatchEvent(this.endEvent);
                    this.state = -1;
                }
                onMouseWheel(event) {
                    if (this.enabled === false || this.enableZoom === false || (this.state !== -1 && this.state !== 0))
                        return;
                    event.preventDefault();
                    event.stopPropagation();
                    this.handleMouseWheel(event);
                    this.dispatchEvent(this.startEvent);
                    this.dispatchEvent(this.endEvent);
                }
                onKeyDown(event) {
                    if (this.enabled === false || this.enableKeys === false || this.enablePan === false)
                        return;
                    switch (event.keyCode) {
                        case 38:
                            this.pan(0, this.keyPanSpeed);
                            this.update();
                            break;
                        case 40:
                            this.pan(0, -this.keyPanSpeed);
                            this.update();
                            break;
                        case 37:
                            this.pan(this.keyPanSpeed, 0);
                            this.update();
                            break;
                        case 39:
                            this.pan(-this.keyPanSpeed, 0);
                            this.update();
                            break;
                    }
                }
                onTouchStart(event) {
                    if (this.enabled === false)
                        return;
                    switch (event.touches.length) {
                        case 1:
                            if (this.enableRotate === false)
                                return;
                            this.handleTouchStartRotate(event);
                            this.state = 3;
                            break;
                        case 2:
                            if (this.enableZoom === false)
                                return;
                            this.handleTouchStartDolly(event);
                            this.state = 4;
                            break;
                        case 3:
                            if (this.enablePan === false)
                                return;
                            this.handleTouchStartPan(event);
                            this.state = 5;
                            break;
                        default:
                            this.state = -1;
                    }
                    if (this.state !== -1) {
                        this.dispatchEvent(this.startEvent);
                    }
                }
                onTouchMove(event) {
                    if (this.enabled === false)
                        return;
                    event.preventDefault();
                    event.stopPropagation();
                    switch (event.touches.length) {
                        case 1:
                            if (this.enableRotate === false)
                                return;
                            if (this.state !== 3)
                                return;
                            this.handleTouchMoveRotate(event);
                            break;
                        case 2:
                            if (this.enableZoom === false)
                                return;
                            if (this.state !== 4)
                                return;
                            this.handleTouchMoveDolly(event);
                            break;
                        case 3:
                            if (this.enablePan === false)
                                return;
                            if (this.state !== 5)
                                return;
                            this.handleTouchMovePan(event);
                            break;
                        default:
                            this.state = -1;
                    }
                }
                onTouchEnd(event) {
                    if (this.enabled === false)
                        return;
                    this.dispatchEvent(this.endEvent);
                    this.state = -1;
                }
                onContextMenu(event) {
                    event.preventDefault();
                }
            };
            OrbitControls.EPS = 0.000001;
            exports_1("OrbitControls", OrbitControls);
        }
    };
});
//# sourceMappingURL=OrbitControls.js.map