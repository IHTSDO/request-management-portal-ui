export class Configuration {
    version: string;
    jiraUrl: string;
    terminologyServerEndpoint: string;
    instances: Instance[];
    languages: Language[];
}

export class Instance {
    code: string;
    instanceFlag: string;
    instanceName: string;
    defaultLanguage: string;
    projectKey: string;
    contactUsUrl: string;
    userGuideUrl: string;
}

export class Language {
    languageCode: string;
    languageFlag: string;
    languageName: string;
}
