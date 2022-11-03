import { discover } from "../../../common/data/FiltersManager";
import { DoubleRange } from "./DoubleRange";

export class DoubleRangeYear extends DoubleRange {

	updateValues(){
		discover.value.min = this.value1;
		discover.value.max = this.value2;
	}
}