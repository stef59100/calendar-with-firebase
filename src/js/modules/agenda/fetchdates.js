class Agenda {
    constructor() {
        this.evenements = db.collection('events').get();
    }

    async getDates() {      
        const data = this.evenements;       
        return data;        
    };
}
export {Agenda as default};