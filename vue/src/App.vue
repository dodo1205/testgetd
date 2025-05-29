<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div class="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dydhzo Subtitles</h1>
                <p class="text-gray-600 dark:text-gray-400">Curated subtitles for your viewing experience</p>
                <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">Version: 1.0.0</p>
            </div>

            <div class="mb-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Select Language</h2>
                <div class="relative">
                    <input 
                        v-model="state.searchQuery" 
                        @input="searchLanguages" 
                        type="text" 
                        placeholder="Search for a language..." 
                        class="w-full p-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <div v-if="state.filteredLanguages.length > 0" class="mt-2 max-h-48 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
                    <button 
                        v-for="lang in state.filteredLanguages" 
                        :key="lang.id" 
                        @click="selectLanguage(lang)" 
                        class="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900 text-gray-900 dark:text-white"
                    >
                        {{ lang.name }}
                    </button>
                </div>
                <div v-else-if="state.searchQuery" class="mt-2 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-400">
                    No languages found matching "{{ state.searchQuery }}"
                </div>
            </div>

            <div class="mb-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Selected Language</h2>
                <p class="text-gray-700 dark:text-gray-300">{{ state.selectedLanguage.name || 'None selected' }}</p>
            </div>

            <div class="flex justify-center">
                <button 
                    :disabled="!state.selectedLanguage.id" 
                    @click="installAddon" 
                    class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                    Install Addon
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useHead } from "@vueuse/head";
import * as langs from '../../languages.json';

const languages = langs.default;

useHead({
    title: 'Dydhzo Subtitles - Stremio Addon',
    link: [
        {
            rel: "icon",
            type: "image/svg+xml",
            href: "/favicon.ico",
        }
    ],
});

const state = reactive({
    searchQuery: '',
    filteredLanguages: [],
    selectedLanguage: { id: '', name: '' },
});

function searchLanguages() {
    if (state.searchQuery.trim() === '') {
        state.filteredLanguages = [];
        return;
    }
    const query = state.searchQuery.toLowerCase();
    state.filteredLanguages = languages.filter(lang => lang.name.toLowerCase().includes(query)).slice(0, 10);
}

function selectLanguage(lang) {
    state.selectedLanguage = { id: lang.id, name: lang.name };
    state.searchQuery = '';
    state.filteredLanguages = [];
}

function installAddon() {
    if (!state.selectedLanguage.id) return;
    const configuration = state.selectedLanguage.id ? '/' + state.selectedLanguage.id : '';
    const location = window.location.host + configuration + '/manifest.json';
    window.location.href = 'stremio://' + location;
}

onMounted(() => {
    // Any initialization if needed
});
</script>

<style scoped>
/* Custom scrollbar for the language dropdown */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
    background: #b0bcc9;
}
</style>