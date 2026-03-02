export async function uploadAvatar(file: File, userId: string) {
  return { data: { path: `avatars/${userId}` }, error: null };
}

export async function uploadProductImage(file: File, productId: string) {
  return { data: { path: `products/${productId}` }, error: null };
}
