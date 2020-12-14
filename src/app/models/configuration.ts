export class Configuration {
    version: string;
    jiraUrl: string;
    terminologyServerEndpoint: string;
    extensions: [
        {
            key: string;
            projectKey: string;
            contactUsUrl: string;
            userGuideUrl: string;
            uiLanguage: string;
        }
    ];
    extension: {
        key: string;
        projectKey: string;
        contactUsUrl: string;
        userGuideUrl: string;
        uiLanguage: string;
    };
}
