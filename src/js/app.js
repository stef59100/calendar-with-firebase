import '../css/main.scss';
//import Agenda from './modules/agenda/fetchdates';
import { BuildAgenda } from './modules/agenda/buildUi';


//const dateList = new Agenda();
//displayUi.displayAgenda();
const agendaDom = new BuildAgenda();
agendaDom.init();
agendaDom.displayAgenda();

//

