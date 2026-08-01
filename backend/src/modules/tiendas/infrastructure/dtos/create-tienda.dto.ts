import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTiendaDto {
  @IsNotEmpty({ message: 'El nombre de la tienda es obligatorio.' })
  @IsString({ message: 'El nombre debe ser un texto.' })
  @MinLength(3, { message: 'El nombre de la tienda debe tener al menos 3 caracteres.' })
  nombre: string;

  @IsNotEmpty({ message: 'La dirección es obligatoria.' })
  @IsString({ message: 'La dirección debe ser un texto.' })
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres.' })
  direccion: string;
}
