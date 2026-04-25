export const DEFAULT_PRODUCT_PLACEHOLDER = 'https://placehold.co/400x220/e8f0fe/1a3a6b?text=Foto'

/**
 * Regras de persistência de imagens no admin:
 * - Cadastro novo: garante ao menos uma imagem visível (placeholder).
 * - Edição: permite salvar sem fotos (remoção total intencional).
 */
export function finalizeAdminProductImages(images: string[], isEditing: boolean): string[] {
  if (images.length > 0) return images
  if (isEditing) return []
  return [DEFAULT_PRODUCT_PLACEHOLDER]
}
