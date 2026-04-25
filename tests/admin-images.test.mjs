import { describe, expect, it } from 'vitest'
import { DEFAULT_PRODUCT_PLACEHOLDER, finalizeAdminProductImages } from '../src/utils/adminImages.ts'

describe('finalizeAdminProductImages', () => {
  it('mantém imagens existentes no cadastro novo', () => {
    const out = finalizeAdminProductImages(['https://img.exemplo/a.jpg'], false)
    expect(out).toEqual(['https://img.exemplo/a.jpg'])
  })

  it('usa placeholder no cadastro novo quando sem imagem', () => {
    const out = finalizeAdminProductImages([], false)
    expect(out).toEqual([DEFAULT_PRODUCT_PLACEHOLDER])
  })

  it('permite edição sem imagens (remoção total intencional)', () => {
    const out = finalizeAdminProductImages([], true)
    expect(out).toEqual([])
  })
})
