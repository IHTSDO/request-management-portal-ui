export class UIConfiguration {
    constructor(
        public endpoints: Endpoints
    ) {}
}

export class Endpoints {
    constructor(
        public imsEndpoint: string,
        public terminologyServerEndpoint: string,
        public collectorEndpoint: string,
        public reportingUserGuideEndpoint: string,
        public contactUsEndpoint: string
    ) {}
}
