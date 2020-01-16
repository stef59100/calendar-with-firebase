
let formDiv = document.querySelector('.js-eventForm');
const overlayDOM = document.querySelector(".js-overlay");
const DateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

class BuildAgenda {
    constructor() {
        this.domElement = document.querySelector("#agenda");
        this.time = new Date();
        this.year = this.time.getFullYear();
        this.month = this.time.getMonth();
        this.content = document.createElement('div');
        this.monthDiv = document.createElement('div');

        // Liste des mois
        this.monthList = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aôut', 'septembre', 'octobre', 'novembre', 'décembre'];
        // Liste des jours de la semaine
        this.dayList = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        //Date actuelle à laquelle le calendrier va etre initialisé
        this.time.setHours(0, 0, 0);
        // Mois actuel
        this.currentMonth = new Date(this.year, this.month, 1);

    }
    init() {
        db.collection('events').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                const doc = change.doc;
                switch (change.type) {
                    case 'added':
                        let timeS = (doc.data().event_timestamp != '') ? doc.data().event_timestamp : null;
                        let eventTitle = doc.data().title;
                        let eventDescription = doc.data().description;
                        let eventId = doc.id;
                        console.log(timeS, eventTitle, eventDescription);
                        this.displayCalendarEvents(timeS, eventTitle, eventDescription, eventId);
                        break;
                    case 'removed':
                        console.log('removed');
                        break;
                }
            })
            //snapshot.forEach(doc => {
            //     let timeS = (doc.data().event_timestamp !='')?doc.data().event_timestamp:null;
            //     let eventTitle = doc.data().title;
            //     let eventDescription = doc.data().description;
            //     let eventId = doc.id;
            //     console.log(timeS,eventTitle,eventDescription);
            //    this.displayCalendarEvents(timeS, eventTitle, eventDescription, eventId);

            // })

        })
    }
    displayAgenda() {
        //construction du header
        let header = document.createElement('div');
        header.classList.add('header', 'deep-orange', 'base');
        this.domElement.appendChild(header);
        //Affichage des jours
        this.content.classList.add('content', 'row');
        this.domElement.appendChild(this.content);
        // Bouton "précédent"
        let previousButton = document.createElement('button');
        previousButton.setAttribute('data-action', '-1');
        previousButton.classList.add('btn', 'js-nav');
        previousButton.textContent = '\u003c';
        header.appendChild(previousButton);

        // Div qui contiendra le mois/année affiché
        this.monthDiv.classList.add('month');
        header.appendChild(this.monthDiv);

        // Bouton "suivant"
        let nextButton = document.createElement('button');
        nextButton.setAttribute('data-action', '1');
        nextButton.textContent = '\u003e';
        nextButton.classList.add('btn', 'js-nav');
        header.appendChild(nextButton);

        // Action des boutons "précédent" et "suivant"
        this.domElement.querySelectorAll('.js-nav').forEach(element => {
            element.addEventListener('click', () => {
                // On multiplie par 1 les valeurs pour forcer leur conversion en "int"
                this.currentMonth.setMonth(this.currentMonth.getMonth() * 1 + element.dataset.action * 1);
                this.loadMonth(this.currentMonth);
                this.init();
            });
        });

        this.loadMonth(this.currentMonth);
    }
    loadMonth(date) {
        // On vide notre calendrier
        this.content.textContent = '';

        // On ajoute le mois/année affiché
        this.monthDiv.textContent = `${this.monthList[date.getMonth()].toUpperCase()}  ${date.getFullYear()}`;

        // Création des cellules contenant le jour de la semaine
        for (let i = 0; i < this.dayList.length; i++) {
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add('day');
            cell.textContent = this.dayList[i].substring(0, 3).toUpperCase();
            this.content.appendChild(cell);
        }

        // Création des cellules vides si nécessaire
        for (let i = 0; i < date.getDay(); i++) {
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add('empty');
            this.content.appendChild(cell);
        }

        // Nombre de jour dans le mois affiché
        let monthLength = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

        // Création des cellules contenant les jours du mois affiché
        for (let i = 1; i <= monthLength; i++) {
            let cell = document.createElement('div');
            let dayDigit = document.createElement('div');
            let eventContent = document.createElement('div');
            eventContent.classList.add('event-content');
            cell.classList.add('cell');
            if (i % 2 == 0) { cell.classList.add('odd') } else { cell.classList.add('even') };
            dayDigit.textContent = `${i}`;
            cell.appendChild(dayDigit);
            cell.appendChild(eventContent);
            this.content.appendChild(cell);

            // Timestamp de la cellule
            let timestamp = new Date(date.getFullYear(), date.getMonth(), i).getTime();
            cell.dataset.identifier = timestamp;
            cell.dataset.period ="unlocked";

            cell.addEventListener('click', e => {
                console.log(e.target, e.target.parentElement);
                if(e.target.parentElement.classList.contains('event') && e.target.parentElement.dataset.period==="unlocked"){
                    console.log('il y a un event');
                    let isEvent = true;
                    let eventTitle = e.target.parentElement.querySelector('.event-title').textContent;
                    let eventDesc = e.target.parentElement.querySelector('.event-desc').textContent;
                    //console.log(eventTitle);
                    this.showForm(cell.dataset.identifier, isEvent, eventTitle, eventDesc);
                }   else if (e.target.parentElement.dataset.period==="unlocked") {
                    console.log('ca foire');
                    this.showForm(cell.dataset.identifier, null, null, null);
                }
            })

            // Ajoute une classe spéciale pour aujourd'hui
            if (timestamp === this.time.getTime()) {
                cell.classList.add('today');
            } else if (timestamp < this.time.getTime()) {
                cell.classList.add('past');
                cell.dataset.period = "locked";
            }
        }
    }
    showForm(timestamp, isEvent, eventTitle, eventDesc) {
        //on fait apparaitre l'overlay
       if (isEvent === true && eventTitle && eventDesc){
           formDiv.querySelector('.js-eventTitle').value= eventTitle ;
           formDiv.querySelector('.js-eventDesc').value= eventDesc;
        } 
       
        overlayDOM.style.zIndex = "9998";
        overlayDOM.style.opacity = "1";
        let selectedDay = new Date(parseInt(timestamp));
        let selectedMonth = selectedDay.getMonth();
       
        selectedDay = selectedDay.toLocaleString('fr-FR', DateOptions);
        //console.log(selectedDay);              
        
        formDiv.querySelector('.form-header').innerHTML= ` <h4>Nouvel évènement - ${selectedDay}</h4>`;    

        formDiv.dataset.timestamp = timestamp;
        formDiv.classList.toggle('hidden');
        this.hideForm();

        //On appelle addEvent en passant en paramètre le timestamp de la cellule 
        this.addEvent(timestamp, selectedMonth);
    }
    hideForm() {
        overlayDOM.addEventListener('click', () => {

            if (!formDiv.classList.contains('hidden')) {
                formDiv.classList.add('hidden');
            }
            overlayDOM.style.zIndex = "-1";
            overlayDOM.style.opacity = "0";
        })
    }
    // stockage  de l'evenement en local storage
    addEvent(timestamp, selectedMonth) {
        let recordButton = document.querySelector('.js-store');
        let titleField = document.querySelector('.js-eventTitle');
        let eventDesc = document.querySelector('.js-eventDesc');

        recordButton.addEventListener('click', (e) => {
            //On vérifie dans un premier temps que les champs sont remplis
            console.log('click', timestamp);
            if (titleField.value != '' && eventDesc != '') {

                //on construit un objet avec "timestamp", "title" et "description"
                const eventItem = {
                    event_timestamp: firebase.firestore.Timestamp.fromMillis(parseInt(timestamp)),
                    title: titleField.value,
                    description: eventDesc.value
                };

                //Si tout est OK on pousse eventItem dans le tableau events
                db.collection('events').add(eventItem).then(() => {
                    console.log('event added');
                    this.init();
                    //this.loadMonth(selectedMonth);
                }).catch(err => {
                    console.log(err)
                });
                //on referme et on réinitialise les champs
                e.target.parentElement.parentElement.parentElement.classList.toggle('hidden');
                overlayDOM.style.zIndex = "-1";
                overlayDOM.style.opacity = "0";

                titleField.value = ``;
                eventDesc.value = '';
            }
        })
    }
    deleteEvent() {
        let removeBttn = document.querySelectorAll('.js-remove');

        removeBttn.forEach(item => {
            item.addEventListener('click', e => {
                const parentContainer = item.parentElement.parentElement;
                const broContainer = parentContainer.querySelector('.event-content');
                e.stopPropagation();
                console.log(broContainer);
                parentContainer.classList.remove('event');
                broContainer.innerHTML = '';
                let event_timestamp = e.target.dataset.event;
                db.collection('events').doc(event_timestamp).delete();
            }, false)
        })
    }
    displayCalendarEvents(tStamp, title, eventDescription, eventId) {

        let eventT = title;
        console.log(tStamp.toMillis(), eventT);

        //Parcourir tous les ".cell", lire leur "data-dentifier"
        // si le data-identifier existe dans l'un des events de l'agenda, on affiche l'evenement dans la cellule
        let timestampedCells = document.querySelectorAll('.cell');
        timestampedCells.forEach((cell) => {
            let cellTimestamp = cell.dataset.identifier;
            //console.log(parseInt(cellTimestamp));
            let eventContent = cell.querySelector('.event-content');
            if (tStamp.toMillis() == cellTimestamp) {
                console.log('cell ok', eventT, tStamp.toMillis());
                cell.classList.add('event');
                eventContent.innerHTML = `<span class="event-title">${eventT}</span><span class="event-desc">${eventDescription}</span>
                <button class="btn orange base js-remove" data-event="${eventId}"  data-id="${cellTimestamp}">Supprimer</button>`;
                this.deleteEvent(cellTimestamp);
            }
           
        })
    }
    stopEvent(e) {
        e.stopPropagation();
    }
}
export { BuildAgenda };