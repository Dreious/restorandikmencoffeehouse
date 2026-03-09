import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

type Product = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  link: string;
};

type Category = {
  id: string;
  title: string;
  icon: string;
  products: Product[];
};

const menuData = require('../../data/menu.json') as {
  categories: Category[];
};

const WEB_IMAGE_ORIGIN = 'https://restorandikmencoffeehouse.pages.dev';
const FALLBACK_IMAGE = `${WEB_IMAGE_ORIGIN}/images/yiyecek-1.jpeg`;

function resolveImageUri(image: string) {
  if (!image) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(image)) return image;
  if (Platform.OS === 'web') return image;
  return `${WEB_IMAGE_ORIGIN}${image.startsWith('/') ? image : `/${image}`}`;
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [imageFailed, setImageFailed] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState(16 / 9);

  const allProducts = menuData.categories.flatMap((category) => category.products);
  const product = allProducts.find((item) => item.id === id);
  const category = menuData.categories.find((item) => item.products.some((p) => p.id === id));

  useEffect(() => {
    if (!product) return;

    const uri = resolveImageUri(imageFailed ? FALLBACK_IMAGE : product.image);
    Image.getSize(
      uri,
      (width, height) => {
        if (width > 0 && height > 0) {
          setImageAspectRatio(width / height);
        }
      },
      () => setImageAspectRatio(16 / 9)
    );
  }, [product, imageFailed]);

  if (!product) {
    return (
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Ürün Bulunamadı</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundTitle}>Bu ürün bulunamadı.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.push('/')}>
            <Text style={styles.primaryBtnText}>Menüye Dön</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{product.name}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: imageFailed ? FALLBACK_IMAGE : resolveImageUri(product.image) }}
            style={[styles.image, { aspectRatio: imageAspectRatio }]}
            resizeMode="contain"
            onError={() => setImageFailed(true)}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.categoryText}>{category?.title}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{product.price}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f8feff',
  },
  header: {
    height: 62,
    backgroundColor: '#0a5ccf',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 26,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  imageWrap: {
    width: '100%',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    maxWidth: 980,
    maxHeight: 560,
    borderRadius: 12,
  },
  infoCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d6ecef',
    padding: 16,
  },
  categoryText: {
    color: '#0f646c',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  name: {
    color: '#0b3840',
    fontSize: 28,
    fontWeight: '800',
  },
  price: {
    color: '#0f646c',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 2,
  },
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 14,
  },
  notFoundTitle: {
    color: '#0b3840',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#0f646c',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
