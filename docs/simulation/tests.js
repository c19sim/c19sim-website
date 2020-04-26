class Tests {
    constructor(testTime){
      this._currentTime = [0];
      this._testIDs = [];
      this._testTime = testTime;
    }

    setCurrentTime(time){
        this._currentTime[0] = time;
    }
    
    buildIDs(testPercentage, populationSize){
        let testQuantity = Math.floor(testPercentage * populationSize);
        while(this._testIDs.length < testQuantity){
            let subject = Math.floor(Math.random() * (populationSize - 1)) + 1;
            if( this._testIDs.indexOf(subject) === -1) this._testIDs.push(subject);
        }
    }

    isTime() {
        return this._currentTime >= this._testTime;
    }

    isTested(id) {
        return this._testIDs.indexOf(id) != -1;
    }

};