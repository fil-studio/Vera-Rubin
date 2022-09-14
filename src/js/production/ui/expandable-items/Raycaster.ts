import { PerspectiveCamera } from "three";
import { OrthographicCamera } from "three";
import { Object3D } from "three";
import { Raycaster } from "three";
import { expandableItems } from "./ExpandableItems";


export const RAYCASTER = {
	instance: null,
	active: false,
	watch: [],
	// instersects: null
}

export const POINTER = {
	x: 0,
	y: 0
}

export const initRaycaster = () => {
	RAYCASTER.instance = new Raycaster();

	window.addEventListener('pointermove', (e) => {
		POINTER.x = ( e.clientX / window.innerWidth ) * 2 - 1;
		POINTER.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
	})

	// Raycaster Click
	document.addEventListener('click', () => {	
		raycasterClick();
	})
}

const raycasterClick = () => {

	if(!RAYCASTER.active) return;
	if(RAYCASTER.watch.length === 0) return;

	const intersects = RAYCASTER.instance.intersectObjects(RAYCASTER.watch);
	if(!intersects || intersects.length === 0) return;
	
	for(const element of RAYCASTER.watch){
		
		if(element.mesh === intersects[0].object){
			clickedElement(element);
			return;
		}
	}	
}

const clickedElement = (element:any) => {

	const item = expandableItems.find(x => x.name === element.name);

	if(!item) {
		console.log('No expandable item by this name:', element.name);
		return
	}
	
	for(const _item of expandableItems){
		if(_item.visible) _item.disable();
	}
	
	item.enable();

}

export const updateRaycasterWatch = (elements:Array<Object3D>) => {
	RAYCASTER.watch = [...elements, ...RAYCASTER.watch];
}

export const updateRaycaster = (camera:PerspectiveCamera | OrthographicCamera ) => {

	if(!RAYCASTER.active) return;
	if(RAYCASTER.watch.length === 0) return;	

	RAYCASTER.instance.setFromCamera(POINTER, camera);

}

