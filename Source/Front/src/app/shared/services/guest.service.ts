import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

/**
 * Servicio para gestionar identificadores de invitados (guest_id)
 *
 * Este servicio permite que usuarios no autenticados puedan:
 * - Navegar por el sitio
 * - Agregar productos al carrito
 * - Mantener su sesión de compra
 *
 * El guest_id se sincroniza con el backend a través de cookies HTTP-only
 */
@Injectable({
  providedIn: 'root'
})
export class GuestService {

  private readonly GUEST_ID_KEY = 'guest_id_local';
  private guestId: string | null = null;

  constructor() {
    this.initializeGuestId();
  }

  /**
   * Inicializa el guest_id desde localStorage
   * El backend enviará su propia cookie, pero mantenemos una copia local
   */
  private initializeGuestId(): void {
    // Intentar recuperar guest_id del localStorage
    this.guestId = localStorage.getItem(this.GUEST_ID_KEY);

    // Si no existe, generar uno nuevo
    if (!this.guestId) {
      this.generateNewGuestId();
      console.log('🆕 Nuevo guest_id generado en frontend:', this.guestId);
    } else {
      console.log('✅ Guest_id recuperado del localStorage:', this.guestId);
    }
  }

  /**
   * Genera un nuevo guest_id UUID v4
   */
  private generateNewGuestId(): void {
    this.guestId = uuidv4();
    localStorage.setItem(this.GUEST_ID_KEY, this.guestId);
  }

  /**
   * Obtiene el guest_id actual
   * @returns El guest_id del usuario invitado
   */
  getGuestId(): string {
    if (!this.guestId) {
      this.initializeGuestId();
    }
    return this.guestId!;
  }

  /**
   * Verifica si el usuario actual es un invitado (no autenticado)
   * @returns true si es invitado, false si está autenticado
   */
  isGuest(): boolean {
    return !localStorage.getItem('token') && !localStorage.getItem('user');
  }

  /**
   * Limpia el guest_id cuando el usuario se autentica
   * El carrito del invitado debe ser migrado al usuario antes de llamar esto
   */
  clearGuestId(): void {
    this.guestId = null;
    localStorage.removeItem(this.GUEST_ID_KEY);
    console.log('🗑️ Guest_id eliminado (usuario autenticado)');
  }

  /**
   * Obtiene información sobre el estado del usuario
   * @returns Objeto con información del usuario/invitado
   */
  getUserInfo(): { isGuest: boolean; guestId: string | null; userId: number | null } {
    const isGuest = this.isGuest();
    const userId = isGuest ? null : this.getUserId();

    return {
      isGuest,
      guestId: isGuest ? this.getGuestId() : null,
      userId
    };
  }

  /**
   * Obtiene el ID del usuario autenticado
   * @returns El ID del usuario o null si no está autenticado
   */
  private getUserId(): number | null {
    const idUser = localStorage.getItem('idUser');
    return idUser ? parseInt(idUser) : null;
  }

  /**
   * Renueva el guest_id (útil después de completar una compra como invitado)
   */
  renewGuestId(): void {
    this.generateNewGuestId();
    console.log('🔄 Guest_id renovado:', this.guestId);
  }
}
