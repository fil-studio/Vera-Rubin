import { onChange } from "../pagination/History";
import { Page } from "./Page";


export class CustomizeOrbits extends Page {
	addEventListeners(): void {
		
		const btn = this.dom.querySelector('#customize-orbits-button');

		btn.addEventListener('click', (e) => {
			
			e.preventDefault();
			onChange('/orbit-viewer');
		})

	}
}