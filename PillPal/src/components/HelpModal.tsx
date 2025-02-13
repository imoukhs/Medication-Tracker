import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHelp } from '../context/HelpContext';
import { HelpArticle } from '../types/help';

const { width } = Dimensions.get('window');

const HelpModal: React.FC = () => {
  const { colors } = useTheme();
  const {
    isHelpModalVisible,
    hideHelpModal,
    currentGuide,
    currentStepIndex,
    nextStep,
    previousStep,
    completeGuide,
    searchHelp,
  } = useHelp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      setIsSearching(true);
      const results = await searchHelp(query);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const renderGuideContent = () => {
    if (!currentGuide) return null;

    const currentStep = currentGuide.steps[currentStepIndex];
    const isLastStep = currentStepIndex === currentGuide.steps.length - 1;

    return (
      <View style={styles.guideContainer}>
        <Text style={[styles.guideTitle, { color: colors.text }]}>
          {currentGuide.title}
        </Text>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Step {currentStepIndex + 1}: {currentStep.title}
        </Text>
        {currentStep.image && (
          <Image
            source={{ uri: currentStep.image }}
            style={styles.stepImage}
            resizeMode="contain"
          />
        )}
        <Text style={[styles.stepContent, { color: colors.textSecondary }]}>
          {currentStep.content}
        </Text>
        <View style={styles.navigationButtons}>
          {currentStepIndex > 0 && (
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: colors.surface }]}
              onPress={previousStep}
            >
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
              <Text style={[styles.navButtonText, { color: colors.primary }]}>
                Previous
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (isLastStep) {
                completeGuide(currentGuide.id);
              } else {
                nextStep();
              }
            }}
          >
            <Text style={styles.navButtonText}>
              {isLastStep ? 'Finish' : 'Next'}
            </Text>
            {!isLastStep && (
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSearchResults = () => (
    <ScrollView style={styles.searchResults}>
      {isSearching ? (
        <Text style={[styles.searchStatus, { color: colors.textSecondary }]}>
          Searching...
        </Text>
      ) : searchResults.length > 0 ? (
        searchResults.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={[styles.articleItem, { borderBottomColor: colors.border }]}
          >
            <Text style={[styles.articleTitle, { color: colors.text }]}>
              {article.title}
            </Text>
            <Text
              style={[styles.articlePreview, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {article.content}
            </Text>
            <View style={styles.articleMeta}>
              <Text style={[styles.articleCategory, { color: colors.primary }]}>
                {article.category}
              </Text>
              <Text style={[styles.articleDate, { color: colors.textSecondary }]}>
                Updated: {new Date(article.lastUpdated).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      ) : searchQuery.length >= 2 ? (
        <Text style={[styles.searchStatus, { color: colors.textSecondary }]}>
          No results found
        </Text>
      ) : null}
    </ScrollView>
  );

  return (
    <Modal
      visible={isHelpModalVisible}
      animationType="slide"
      transparent
      onRequestClose={hideHelpModal}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={hideHelpModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {currentGuide ? 'Guide' : 'Help Center'}
            </Text>
          </View>

          {!currentGuide && (
            <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search for help..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>
          )}

          {currentGuide ? renderGuideContent() : renderSearchResults()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  searchResults: {
    padding: 16,
  },
  searchStatus: {
    textAlign: 'center',
    padding: 16,
  },
  articleItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  articlePreview: {
    fontSize: 14,
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  articleDate: {
    fontSize: 12,
  },
  guideContainer: {
    padding: 16,
  },
  guideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  stepImage: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  stepContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 8,
  },
});

export default HelpModal; 