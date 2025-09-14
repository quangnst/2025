import { plainToInstance } from 'class-transformer'
import { IsString, validateSync } from 'class-validator'
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv'

config({
    path: '.env'
})

if(!fs.existsSync(path.resolve('.env'))) {
    console.log("Khong tim thay file .env")
    process.exit(1);
}

class ConfigSchema {
  @IsString()
  DATABASE_URL: string;
  @IsString()
  ACCESS_TOKEN_SECRET: string;
  @IsString()
  ACCESS_TOKEN_EXPIRES_IN: string;
  @IsString()
  REFRESH_TOKEN_SECRET: string;
  @IsString()
  REFRESH_TOKEN_EXPIRES_IN: string;
}

const configServer = plainToInstance(ConfigSchema, process.env)
const errorArray = validateSync(configServer);

if (errorArray.length > 0) {
  console.log('Values declared in the .env file are invalid');
  const errors = errorArray.map((eItem) => {
    return {
      property: eItem.property,
      constrains: eItem.constraints,
      value: eItem.value,
    };
  });
  throw errors;
}

const envConfig = configServer

export default envConfig