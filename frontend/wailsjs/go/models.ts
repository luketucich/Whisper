export namespace backend {
	
	export class User {
	    id: string;
	    username: string;
	    phone: string;
	    lastSeen: number;
	    isOnline: boolean;
	    publicKey: string;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.username = source["username"];
	        this.phone = source["phone"];
	        this.lastSeen = source["lastSeen"];
	        this.isOnline = source["isOnline"];
	        this.publicKey = source["publicKey"];
	    }
	}

}

