import '../css/main.scss';
import { BuildAgenda } from './modules/agenda/buildUi';


const agendaDom = new BuildAgenda();
agendaDom.init();
agendaDom.displayAgenda();