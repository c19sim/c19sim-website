class IntensiveCare {
    constructor(){
      this._filledICUs = [0];
    }

    addBed(){
        this._filledICUs[0] = this._filledICUs[0] + 1;
    }
    
    getBedNumbers(){
        return this._filledICUs[0]
    }

    releaseBed(){
      this._filledICUs[0] = this._filledICUs[0] - 1;
    }
};