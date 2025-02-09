import dotenv from 'dotenv';


const requiredEnvVars = [ // Now I understand it should be spread throughout project.
    'HOST',
    'PORT',
    'JWT_SECRET',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
];


// For distributed checks
export const stopIfNotExists = (required: string[]) => {
    required.forEach(variable => {
        if (!process.env[variable]) {
            console.error(`Fatal: variable error ${variable} is not specified in environment.`);
            process.exit(1);
        }
    });
};


const loadBasicConfig = () => {
    dotenv.config();
    stopIfNotExists(requiredEnvVars);
};


export default loadBasicConfig;
