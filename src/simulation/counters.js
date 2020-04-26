class Counters {
    constructor(){
      this._filledICUs = [0];
    }

    add(){
        this._filledICUs[0] = this._filledICUs[0] + 1;
    }
    
    get(){
        return this._filledICUs[0]
    }

    remove(){
      this._filledICUs[0] = this._filledICUs[0] - 1;
      console.log(this._filledICUs[0]);
    }
};