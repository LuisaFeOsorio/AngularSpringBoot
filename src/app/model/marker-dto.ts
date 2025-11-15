import {LocationDTO} from './location-dto';

export interface MarkerDTO {
  id: number,
  location: LocationDTO,
  title: string,
  photoUrl: string
}
