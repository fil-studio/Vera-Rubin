import { WebGLSketch } from "@jocabola/gfx";
import { io } from "@jocabola/io";
import { AmbientLight, Clock, Group, Mesh, MeshPhongMaterial, Object3D, PerspectiveCamera, PointLight, SphereGeometry } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initRaycaster, updateRaycaster, updateRaycasterWatch } from "../../production/ui/expandable-items/Raycaster";
import { getEntryById } from "../data/DataManager";
import { loadData } from "../data/DataMap";
import { getSolarSystemElements } from "../data/GetData";
import { initSunMaterial } from "../gfx/ShaderLib";
import { initShaders } from "../gfx/shaders";
import { VFXRenderer } from "../gfx/VFXRenderer";
import { TRAJ_LINE_MAT } from "../solar/EllipticalPath";
import { Planet } from "../solar/Planet";
import { SolarClock } from "../solar/SolarClock";
import { SolarParticles } from "../solar/SolarParticles";
import { OrbitElements } from "../solar/SolarSystem";
import { mapOrbitElements, OrbitDataElements } from "../solar/SolarUtils";
import { SunLightHelper } from "../solar/SunLightHelper";
import { SunParticles } from "../solar/SunParticles";
import { CLOCK_SETTINGS, CONTROLS } from "./Globals";

const GEO = new SphereGeometry(1, 32, 32);

const data = new Array<OrbitElements>();
const dummy = new Object3D();

const FILES = ["iso_elems.json", "parabolic_elems_simulated.json", "solarsystem_full_elems_100k.json"];
const PLANETS = "planet_elems.json";
const DWARF_PLANETS = "dwarf_planet_elems.json";

export const solarClock = new SolarClock(new Clock());

export class CoreApp extends WebGLSketch {
    particles:SolarParticles;

    solarClock:SolarClock = solarClock;

    planets:Group = new Group();
    dwarfPlanets:Group = new Group();

    planetPaths:Group = new Group();
    dwarfPlanetPaths:Group = new Group();

    sunLight:PointLight;
    sunLightHelper:SunLightHelper;

    ambientLight:AmbientLight;

    vfx:VFXRenderer;
    sun:Mesh;
    sunParticles:SunParticles;

    constructor() {
        super(window.innerWidth, window.innerHeight, {
            alpha: false,
            antialias: true
        }, false);

        document.body.appendChild(this.domElement);
        this.domElement.classList.add('view');

        this.camera.position.z = 5;

        window.addEventListener('resize', () =>{
            this.resize(window.innerWidth, window.innerHeight);
        });

        initShaders();
        
        initRaycaster();

        this.vfx = new VFXRenderer(this.renderer, window.innerWidth, window.innerHeight);

        const sun = new Mesh(
            GEO,
            initSunMaterial(
                new MeshPhongMaterial({
                    emissive: 0xff6600,
                    emissiveIntensity: 1.5
                })
            )
        );

        sun.scale.setScalar(.05);

        this.scene.add(sun);
        this.sun = sun;
        // this.renderer.physicallyCorrectLights = true;

        this.sunParticles = new SunParticles(sun.scale.x+.006, sun.scale.x * .15);
        this.scene.add(this.sunParticles.mesh);

        this.scene.add(this.planets);
        this.scene.add(this.dwarfPlanets);

        this.scene.add(this.planetPaths);
        this.scene.add(this.dwarfPlanetPaths);

        this.particles = new SolarParticles(this.renderer);
        this.scene.add(this.particles.mesh);

        this.sunLight = new PointLight(0xffffff, 1, 400, 2);
        this.scene.add(this.sunLight);
        this.sunLightHelper = new SunLightHelper(this.sunLight, 0x999900, 0xcc0000);
        this.sunLightHelper.visible = false;
        this.scene.add(this.sunLightHelper);

        this.ambientLight = new AmbientLight(0xffffff, 0.13);
        this.scene.add(this.ambientLight);

        console.log('Core App init');        
        

        io.load(window.location.origin + `/assets/data/${PLANETS}`, (res) => {
            const d = JSON.parse(res)
            this.createPlanets(d);

            io.load(window.location.origin + `/assets/data/${DWARF_PLANETS}`, (res) => {
                const d = JSON.parse(res);
                this.createDwarfPlanets(d);

                getSolarSystemElements().then((res) => {
                    
                    const d = res.mpcorb;
                    this.buildSimWithData(d);
                    
                    loadData(()=> {
                        this.onDataLoaded();
                    });
                });
                
            });

        });
    }

    resize(width: number, height: number): void {
		super.resize(width, height);
		this.vfx.resize(width, height);
	}

    onDataLoaded() {
        console.log('Data Loaded');

        const globals = getEntryById('globals').data;
        // this.updateMeshSettings(globals['demo'] as DemoType);
        
        // --------------------------------------------- Hide loader
        document.body.classList.remove('loader__in-progress');
        document.querySelector('.site__loader')?.remove();
        // --------------------------------------------- Launch
        
        this.launch();
    }

    createPlanets(d:Array<OrbitDataElements>) {
		for(const el of d) {
			const mel = mapOrbitElements(el);
			const planet = new Planet(mel);

			this.planets.add(planet);
			this.planetPaths.add(planet.orbitPath.ellipse);

            updateRaycasterWatch([planet]);
		}
	}

	createDwarfPlanets(d:Array<OrbitDataElements>) {
		for(const el of d) {
			const mel = mapOrbitElements(el);
			const planet = new Planet(mel);

			this.dwarfPlanets.add(planet);
			this.dwarfPlanetPaths.add(planet.orbitPath.ellipse);

            updateRaycasterWatch([planet]);
		}

	}

	buildSimWithData(d:Array<OrbitDataElements>, forceKeep:boolean=false) {
		if(!forceKeep) {
			data.splice(0, data.length);
		}

		for(const el of d) {
			const mel = mapOrbitElements(el);
			data.push(mel);
		}

		this.particles.data = data;

		// update counts
		/* let elliptical = 0;
		let parabolic = 0;
		let nearParabolic = 0;
		let hyperbolic = 0;

		for(const el of data) {
			if(el.type == OrbitType.Elliptical) elliptical++;
			if(el.type == OrbitType.Parabolic) parabolic++;
			if(el.type == OrbitType.NearParabolic) nearParabolic++;
			if(el.type == OrbitType.Hyperbolic) hyperbolic++;
		} */
	}

	playPause() {
		if(this.solarClock.playing) {
			this.solarClock.pause();
		} else {
			this.solarClock.resume();
		}
	}

	importData(d:Array<OrbitDataElements>) {
		this.buildSimWithData(d);
	}

	resetClock() {
		this.solarClock.stop();
		this.solarClock.start();
	}

    launch() {
        this.camera.position.z = 10;
        this.camera.position.y = 3;
        this.camera.lookAt(this.scene.position);

        // Init controls
        CONTROLS.orbit = new OrbitControls(this.camera, this.domElement);
        CONTROLS.orbit.minDistance = CONTROLS.min;
        CONTROLS.orbit.maxDistance = CONTROLS.max;

        window.addEventListener('keydown', (evt) =>{
            if(evt.key == ' ') this.playPause();
        });

        this.start();
        this.solarClock = solarClock;
        this.solarClock.start();
    }

    clockChanged():boolean {
        return (CLOCK_SETTINGS.speed !== this.solarClock.secsPerHour);
    }

    update() {
		super.update();

        updateRaycaster(this.camera);

		CONTROLS.orbit.update();

        if(this.clockChanged())this.solarClock.secsPerHour = CLOCK_SETTINGS.speed;
		const d = this.solarClock.update();
		
		this.particles.update(d, this.camera as PerspectiveCamera);

		if(this.sun.material['uniforms']) {
			this.sun.material['uniforms'].time.value = this.solarClock.time;
		}
		
		for(const c of this.planets.children) {
			const p = c as Planet;
			p.update(d);
		}

		for(const c of this.dwarfPlanets.children) {
			const p = c as Planet;
			p.update(d);
		}

		this.sunParticles.update(this.solarClock.time);

        if(TRAJ_LINE_MAT.shader) {
            TRAJ_LINE_MAT.shader.uniforms.time.value = performance.now() * .001;
        }
	}

    render(): void {
		this.vfx.render(this.scene, this.camera);
	}
}