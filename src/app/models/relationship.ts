export class Relationship {
    constructor(
        public relationshipId: string,
        public type: string,
        public destinationId: string,
        public active: boolean,
        public sourceId: string,
        public typeFsn: string,
        public destinationFsn: string
    ) {}
}

