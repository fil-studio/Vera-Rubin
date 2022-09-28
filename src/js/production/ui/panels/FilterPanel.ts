import { getSolarSystemElementsByFilter, saveSelectedFilters, syncFilters } from "../../../common/data/GetData";
import { buildSimWithData } from "../../../common/solar/SolarParticlesManager";
import { Panel } from "./Panel";


export class FilterPanel extends Panel {
	buttonApply:HTMLButtonElement;
	filters:NodeListOf<HTMLInputElement>

	create(){
		this.filters = this.dom.querySelectorAll('.categories-filter input[type="checkbox"]');
		syncFilters(this.filters);

		this.buttonApply = this.dom.querySelector('[data-button="filters-apply"]');
	}

	addEventListeners(): void {
		super.addEventListeners();

		this.buttonApply.addEventListener('click', () => {
			this.applyFilters();
		})

	}

	togglePanel(): void {
		super.togglePanel();

		if(!this.active) return;
		syncFilters(this.filters);
	}

	applyFilters(){
		
		const needsUpdate = saveSelectedFilters(this.filters);
		
		if(!needsUpdate) return;
		
		getSolarSystemElementsByFilter().then( (res) => {		
			const d = res.mpcorb;                                  
      buildSimWithData(d, false);
		});

	}
	
}