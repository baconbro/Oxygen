import { templateScrum } from "./templates/Scrum"
export interface IAppBasic {
  appName: string
  appType: 'Quick Online Courses' | 'Face to Face Discussions' | 'Full Intro Training'
}

export type TAppFramework = 'Soft' | 'Project' | 'Recruitment' | 'Marketing' | 'Legal' | 'Sales' | 'Portfolio'

export interface IAppDatabase {
  databaseName: string
  databaseSolution: 'MySQL' | 'Firebase' | 'DynamoDB'
}

export type TAppStorage = 'Basic Server' | 'AWS' | 'Google'

export interface ICreateAppData {
  appBasic: IAppBasic
  appFramework: TAppFramework
  appDatabase: IAppDatabase
  appStorage: TAppStorage
  appConfig : any;
}

export const defaultCreateAppData: ICreateAppData = {
  appBasic: {appName: '', appType: 'Quick Online Courses'},
  appFramework: 'Soft',
  appDatabase: {databaseName: 'db_name', databaseSolution: 'MySQL'},
  appStorage: 'Basic Server',
  appConfig : templateScrum
}

export type StepProps = {
  data: ICreateAppData,
  updateData: (fieldsToUpdate: Partial<ICreateAppData>) => void,
  hasError: boolean
}
