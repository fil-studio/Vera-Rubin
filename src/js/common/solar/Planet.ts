import { MathUtils } from "@jocabola/math";
import { BufferGeometry, ColorRepresentation, DoubleSide, Line, Mesh, MeshPhongMaterial, Object3D, SphereGeometry, TextureLoader, Vector3 } from "three";
import { InteractiveObject } from "../../production/ui/popups/Raycaster";
import { PlanetMaterial } from "../gfx/PlanetMaterial";
import { EllipticalPath } from "./EllipticalPath";
import { calculateOrbitByType, DEG_TO_RAD, KM2AU, OrbitElements, OrbitType } from "./SolarSystem";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { initMaterial } from "../gfx/ShaderLib";
import { LineBasicMaterial } from "three";
import { BufferAttribute } from "three";

export const PLANET_GEO = new SphereGeometry(1, 32, 32);
const tLoader = new TextureLoader();

export const PLANET_SCALE = 100;

export type PlanetOptions = {
    color?:ColorRepresentation;
    mapURL?:string;
}

export type PlanetId = 'mercury'|'venus'|'earth'|'mars'|'jupiter'|'saturn'|'uranus'|'neptune';

const gltfLoader = new GLTFLoader();

const L_DUMMY = initMaterial(new LineBasicMaterial({
    color: 0xff0000
}));

export class Planet extends Object3D implements InteractiveObject {
    parent:Object3D = new Object3D();
    mesh:Mesh;
    data:OrbitElements;
    orbitPath:EllipticalPath;
    rotationSpeed:number; 
    private _selected:boolean = false;
    material:PlanetMaterial;
    type:string;
    dwarf:boolean = false;
    target:Object3D;
    lockedDistance:number = 0;
    lockedOffset:Vector3 = new Vector3();
    sunLine:Line;

    constructor(id: PlanetId, _data:OrbitElements, opts:PlanetOptions={}) {
        super();

        this.type = id; 
        this.dwarf = id === null;

        if(!this.dwarf) {
            opts.mapURL = `/assets/textures/2k_${this.type}.jpg`;
            // console.log(id, _data.i);
            
        }

        this.data = _data;        
        this.name = id;

        let fresnelWidth = .005;
        let sunIntensity = .5;
        let scl = .003;

        if(!this.dwarf) {
            // console.log(PlanetRadiusMap[this.type] * KM2AU);
            scl = PlanetRadiusMap[this.type] * KM2AU * PLANET_SCALE;
            this.scale.multiplyScalar(scl);
            // correct fresnel
            const s = MathUtils.smoothstep(0, 0.234, scl);
            fresnelWidth = MathUtils.lerp(fresnelWidth, fresnelWidth*10, s);
            sunIntensity = MathUtils.lerp(.5, .05, s);

            const lock = PlanetLockedMap[this.type];
            this.lockedDistance = lock.distance;
            this.lockedOffset.copy(lock.offset);
            
        } else {
            this.scale.multiplyScalar(.003);
        }

        this.material = new PlanetMaterial({
            color: opts.color ? opts.color : 0xffffff,
            shininess: 0,
            map: opts.mapURL ? tLoader.load(opts.mapURL) : null
        }, {
            fresnelColor: 0x000033,
            fresnelWidth: fresnelWidth,
            sunIntensity: sunIntensity
        });

        const lineGeo = new BufferGeometry();
        const pos = new Float32Array([0,0,0,10,10,10]);
        lineGeo.setAttribute('position', new BufferAttribute(pos, 3));
        this.sunLine = new Line(lineGeo, L_DUMMY);
        // console.log(this.sunLine);
        

        this.orbitPath = new EllipticalPath(_data, scl*.8);

        this.mesh = new Mesh(PLANET_GEO, this.material);
        this.parent.add(this.mesh);
        this.add(this.parent);
        this.target = this;
        // this.add(this.orbitPath.ellipse)
        // this.mesh.rotateZ(Random.randf(-Math.PI/4, Math.PI/4));

        if(id === 'saturn') {
            console.log('Houston, we\'ve got Saturn!');
            gltfLoader.load('/assets/models/ring.glb', (gltf) => {
                console.log(gltf.scene);
                gltf.scene.scale.setScalar(2);
                gltf.scene.children[0].material = initMaterial(new MeshPhongMaterial({
                    side: DoubleSide,
                    transparent: true,
                    map: tLoader.load(`/assets/textures/2k_saturn_ring_alpha.png`)
                }));
                this.mesh.add(gltf.scene);
            })
        }

        // this.rotationSpeed = Random.randf(-1, 1);
        if(!this.dwarf) {
            const rt = PlanetRotationMap[this.type] as PlanetRotationData;
            this.rotationSpeed = DEG_TO_RAD * (360 / rt.period);
            this.parent.rotation.z = DEG_TO_RAD * -(rt.axialTilt + _data.i);
        } else {
            this.rotationSpeed = 0;
        }
    }

    update(d:number) {
        calculateOrbitByType(this.data, d, OrbitType.Elliptical, this.position);
        if(this.rotationSpeed > 0) {
            const rt = PlanetRotationMap[this.type] as PlanetRotationData;
            this.mesh.rotation.y = rt.meridian * DEG_TO_RAD + d * this.rotationSpeed;
        }

        const pos = this.sunLine.geometry.attributes.position;
        const arr = pos.array as Float32Array;
        arr[3] = this.position.x;
        arr[4] = this.position.y;
        arr[5] = this.position.z;
        
        pos.needsUpdate = true;

        // this.mesh.updateMatrixWorld();
        this.material.update();
        this.orbitPath.update(d, this.position, this.scale.x);
    }

    set selected(value:boolean) {
        this._selected = value;
        this.orbitPath.selected = value;
        // this.material.selected = value;
    }

    get selected():boolean {
        return this._selected;
    }
}

export const PlanetRadiusMap:Record<PlanetId,number> = {
    'mercury': 2440,
    'venus': 6052,
    'earth': 6371,
    'mars': 3390,
    'jupiter': 69911,
    'saturn': 58232,
    'uranus': 25360,
    'neptune': 24620
}

export type PlanetRotationData = {
    axialTilt:number;
    period:number;
    meridian:number;
}

export const PlanetRotationMap:Record<PlanetId, PlanetRotationData> = {
    mercury: {
        axialTilt: 0.034,
        period: 58.6462,
        meridian: 329.5988
    },
    venus: {
        axialTilt: 177.36,
        period: 243.018,
        meridian: 160.20
    },
    earth: {
        axialTilt: 23.4392811,
        period: 1,
        meridian: 0
    },
    mars: {
        axialTilt: 25.19,
        period: 1.02595676,
        meridian: 176.049863
    },
    jupiter: {
        axialTilt: 3.13,
        period: 0.41354,
        meridian: 284.95
    },
    saturn: {
        axialTilt: 26.73,
        period: 0.44401,
        meridian: 38.90
    },
    uranus: {
        axialTilt: 97.77,
        period: 0.71833,
        meridian: 203.81
    },
    neptune: {
        axialTilt: 28.32,
        period: 0.67125,
        meridian: 249.978
    }
}

export type CameraLockPosition = {
    distance: number;
    offset: Vector3;
}

export const PlanetLockedMap:Record<PlanetId,CameraLockPosition> = {
    earth: {
        distance: .05,
        offset: new Vector3(-.01, .005, 0)
    },
    mercury: {
        distance: .015,
        offset: new Vector3(-.0025, .0015, 0)
    },
    venus: {
        distance: .05,
        offset: new Vector3(-.01, .01, 0)
    },
    mars: {
        distance: .035,
        offset: new Vector3(-.01, .0025, 0)
    },
    jupiter: {
        distance: .25,
        offset: new Vector3(-.05, .05, 0)
    },
    saturn: {
        distance: .4,
        offset: new Vector3(.05, -.025, 0)
    },
    uranus: {
        distance: .1,
        offset: new Vector3(-.02, .02, 0)
    },
    neptune: {
        distance: .1,
        offset: new Vector3(-.016, .01, 0)
    }
}