import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

type Category = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  products: Product[];
};

type Product = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  link: string;
};

const menuData = require('../data/menu.json') as {
  categories: Category[];
};

const infoNote = 'Hafta içi 12:00-14:00 saatlerinde kahve yanında mini tatlı ikramımız var.';

export default function CoffeeHouseScreen() {
  const { width, height } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === 'web' && width >= 1024;
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    () =>
      menuData.categories.reduce(
        (acc, category) => ({ ...acc, [category.id]: true }),
        {} as Record<string, boolean>
      )
  );

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase('tr');

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) {
      return menuData.categories;
    }

    return menuData.categories
      .map((category) => {
        const filteredProducts = category.products.filter((product) => {
          const haystack = `${product.name} ${product.description} ${category.title}`.toLocaleLowerCase('tr');
          return haystack.includes(normalizedQuery);
        });

        return { ...category, products: filteredProducts };
      })
      .filter((category) => category.products.length > 0);
  }, [normalizedQuery]);

  const featuredProducts = useMemo(
    () => filteredCategories.flatMap((category) => category.products).slice(0, 8),
    [filteredCategories]
  );

  const toggleSection = (categoryId: string) => {
    setExpandedSections((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  return (
    <View style={[styles.page, isDesktopWeb && styles.pageDesktopWeb, isDesktopWeb && { width, minHeight: height }]}>
      <View style={[styles.deviceFrame, isDesktopWeb && styles.deviceFrameDesktopWeb, isDesktopWeb && { width }]}>
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Coffee House</Text>
          <Text style={styles.subHeading}>QR Menü</Text>

          <View style={styles.searchRow}>
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={18} color="#5f6770" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Ürün veya içerik ara"
                placeholderTextColor="#7d8791"
                style={styles.searchInput}
              />
            </View>
          </View>

          {isDesktopWeb ? (
            <View style={[styles.categoryRow, styles.categoryRowDesktopWeb]}>
              {menuData.categories.map((category) => (
                <Pressable
                  key={category.id}
                  style={styles.categoryChip}
                  onPress={() => {
                    setExpandedSections((prev) => ({ ...prev, [category.id]: true }));
                    setSearchQuery(category.title);
                  }}>
                  <Ionicons name={category.icon} size={16} color="#0f646c" />
                  <Text style={styles.categoryChipText}>{category.title}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {menuData.categories.map((category) => (
                <Pressable
                  key={category.id}
                  style={styles.categoryChip}
                  onPress={() => {
                    setExpandedSections((prev) => ({ ...prev, [category.id]: true }));
                    setSearchQuery(category.title);
                  }}>
                  <Ionicons name={category.icon} size={16} color="#0f646c" />
                  <Text style={styles.categoryChipText}>{category.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {isDesktopWeb ? (
            <View style={styles.productsGrid}>
              {featuredProducts.map((product) => (
                <Pressable
                  key={product.id}
                  style={[styles.productCard, styles.productCardDesktopWeb]}
                  onPress={() => router.push(product.link as Href)}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>{product.price}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsRow}>
              {featuredProducts.map((product) => (
                <Pressable key={product.id} style={styles.productCard} onPress={() => router.push(product.link as Href)}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>{product.price}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {featuredProducts.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
              <Text style={styles.emptyText}>Farklı bir kelime deneyebilirsin.</Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Öğlen Menüsü</Text>
            <Text style={styles.infoText}>{infoNote}</Text>
          </View>

          {filteredCategories.map((category) => {
            const isExpanded = !!expandedSections[category.id];

            return (
              <View key={category.id} style={styles.menuSection}>
                <Pressable style={styles.menuSectionHeader} onPress={() => toggleSection(category.id)}>
                  <Text style={styles.menuSectionTitle}>{category.title}</Text>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#0f646c" />
                </Pressable>

                {isExpanded &&
                  category.products.map((product) => (
                    <Pressable
                      key={product.id}
                      style={styles.menuItemRow}
                      onPress={() => router.push(product.link as Href)}>
                      <View style={styles.menuItemInfo}>
                        <Text style={styles.menuItemName}>{product.name}</Text>
                        <Text style={styles.menuItemDesc}>{product.description}</Text>
                      </View>
                      <Text style={styles.menuItemPrice}>{product.price}</Text>
                    </Pressable>
                  ))}
              </View>
            );
          })}

          {!isDesktopWeb && <View style={styles.bottomSpacing} />}
        </ScrollView>

        {!isDesktopWeb && (
          <View style={styles.bottomNav}>
            <Pressable style={styles.bottomItem} onPress={() => router.push('/')}>
              <Ionicons name="reader" size={20} color="#0f646c" />
              <Text style={styles.bottomItemText}>Menü</Text>
            </Pressable>
            <Pressable style={styles.bottomItem} onPress={() => router.push('/contact')}>
              <Ionicons name="call" size={20} color="#0f646c" />
              <Text style={styles.bottomItemText}>İletişim</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#1f4f53',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  pageDesktopWeb: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: '#f8feff',
  },
  deviceFrame: {
    width: '100%',
    maxWidth: 430,
    flex: 1,
    backgroundColor: '#f8feff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  deviceFrameDesktopWeb: {
    maxWidth: 9999,
    width: '100%',
    borderRadius: 0,
    alignSelf: 'stretch',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  heading: {
    textAlign: 'center',
    color: '#0b3840',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  subHeading: {
    textAlign: 'center',
    color: '#0f646c',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d9edef',
    borderRadius: 22,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1d2228',
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 12,
  },
  categoryRowDesktopWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e9fbfc',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#caeef0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryChipText: {
    color: '#0d4e55',
    fontSize: 13,
    fontWeight: '700',
  },
  productsRow: {
    gap: 10,
    paddingBottom: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 16,
  },
  productCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d8edf0',
  },
  productCardDesktopWeb: {
    width: '19%',
    minWidth: 170,
  },
  productImage: {
    width: '100%',
    height: 90,
  },
  productName: {
    paddingHorizontal: 8,
    paddingTop: 8,
    color: '#0b3840',
    fontSize: 13,
    fontWeight: '700',
  },
  productPrice: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    color: '#0f646c',
    fontSize: 13,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: '#e7f8fa',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#cceef2',
    marginBottom: 16,
  },
  infoTitle: {
    textAlign: 'center',
    color: '#0b3840',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  infoText: {
    textAlign: 'center',
    color: '#0e5960',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8edf0',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#0b3840',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    color: '#0e5960',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d6ecef',
    padding: 12,
    marginBottom: 12,
  },
  menuSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  menuSectionTitle: {
    color: '#0b3840',
    fontSize: 24,
    fontWeight: '800',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#edf6f7',
  },
  menuItemInfo: {
    flex: 1,
    gap: 4,
  },
  menuItemName: {
    color: '#123f45',
    fontSize: 16,
    fontWeight: '700',
  },
  menuItemDesc: {
    color: '#4c666a',
    fontSize: 13,
    lineHeight: 18,
  },
  menuItemPrice: {
    color: '#0f646c',
    fontSize: 16,
    fontWeight: '800',
    paddingTop: 2,
  },
  bottomSpacing: {
    height: 18,
  },
  bottomNav: {
    height: 68,
    borderTopWidth: 1,
    borderTopColor: '#d6ecef',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  bottomItemText: {
    color: '#0f646c',
    fontSize: 12,
    fontWeight: '700',
  },
});
