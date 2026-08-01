import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TiendaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado en request.');
    }

    if (user.rol !== 'TIENDA' || !user.tiendaId) {
      throw new ForbiddenException('Acceso restringido: Esta acción requiere estar asignado a una tienda.');
    }

    return true;
  }
}
