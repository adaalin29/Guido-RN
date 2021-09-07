
const config = {
    
    app: {
        name: 'Guido',
        version: '4.3.0',
        development: [
            {
                name: 'TouchMedia360',
                email: 'tehnic@touch-media.ro',
                team: [
                    {name: 'Andrei Telteu', email: 'andrei.telteu@touch-media.ro'},
                    {name: 'Alin Adamita', email: 'alin@touch-media.ro'},
                ],
            },
        ],
    },
    
    services: {
        api: {
            environment: 'production', // production / staging
            endpoint: null,
            endpoint_production: 'https://app-backend.guido.be/api/v2',
            endpoint_staging: '',
        },
    },
};

config.services.api.endpoint = config.services.api['endpoint_'+config.services.api.environment];

export default config;
