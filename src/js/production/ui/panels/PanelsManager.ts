import { FilterPanel } from "./FilterPanel";
import { LanguagePanel } from "./LanguagePanel";
import { Panel } from "./Panel";
import { ResolutionPanel } from "./ResolutionPanel";
import { TimePickerPanel } from "./TimePickerPanel";
import { TourSortPanel } from "./TourSortPanel";


export interface PanelsListener {
	closePanel():void;
}

export const panels:Array<Panel> = [];

export const panelsAddListeners = () => {

	document.addEventListener('keydown', (e) => {			
		if(e.key != 'Escape') return;
		broadcastPanelsClose();
	})

}

export const addPanels = (dom:HTMLElement) => {
	const _panels = dom.querySelectorAll('[data-panel]');

	for(const item of _panels){

		const id = item.getAttribute('data-panel');
		if(!!!item) continue;

		let panel = null
		if(id === 'time-picker') panel = new TimePickerPanel(id);
		else if(id.includes('tour-sort')) panel = new TourSortPanel(id);
		else if(id.includes('lang')) panel = new LanguagePanel(id);
		else if(id.includes('filters')) panel = new FilterPanel(id);
		else if(id.includes('resolution')) panel = new ResolutionPanel(id);
		else panel = new Panel(id);

		if(panel) panels.push(panel);
	}		

}

const panelsListeners: Array<PanelsListener> = [];

export const addPanelListener = (listener: PanelsListener) => {
	if(panelsListeners.includes(listener)) return;
	panelsListeners.push(listener);
}

export const broadcastPanelsClose = () => {
	for(const listener of panelsListeners) listener.closePanel();
}