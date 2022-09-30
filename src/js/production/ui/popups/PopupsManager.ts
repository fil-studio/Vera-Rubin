import { CameraManager } from "../../../common/core/CameraManager";
import { SUN } from "../../../common/core/CoreApp";
import { particles } from "../../../common/solar/SolarParticlesManager";
import { Popup } from "./Popup";
import { RAYCASTER } from "./Raycaster";

export const Popups: Array<Popup> = [];

export const initExpandableItems = () => {;

	const items = document.querySelectorAll('.expandable-item');

	for(const item of items){	
		Popups.push(new Popup(item));
	}

}

export function onShow() {
	particles.highlighted = false;
	RAYCASTER.active = false;
	document.body.classList.add('ui-block');
	SUN.instance.highlight = true;
}

export function onHide() {
	CameraManager.unlock();
	particles.highlighted = true;
	RAYCASTER.active = true;
	SUN.instance.highlight = false;
	document.body.classList.remove('ui-block');
}

export const resizeExpandableItems = () => {
	for(const Popup of Popups) Popup.onResize();
}
