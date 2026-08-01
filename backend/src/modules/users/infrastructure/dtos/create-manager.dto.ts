import { IsEmail, IsNotEmpty, IsUUID, MinLength } from 'class-validator';

export class CreateManagerDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  @IsNotEmpty({ message: 'El ID de la tienda es obligatorio.' })
  @IsUUID('4', { message: 'El ID de la tienda debe ser un UUID válido.' })
  tiendaId: string;
}
