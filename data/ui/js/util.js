if (typeof util == 'undefined') var util = {};
util = {


idcmp:
function idcmp(id1, id2) {
    if (id1.length < id2.length) {
        return 1;
    } else if (id2.length < id1.length) {
        return -1;
    } else {
        if (id1 == id2) 
            return 0;
        else 
            return id1 < id2? 1: -1;
    }
},

};

