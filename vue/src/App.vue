<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        <!-- Background with animation -->
        <div class="absolute inset-0 z-0 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-gradient-background"></div>
            <div class="absolute inset-0 opacity-20 bg-[url('https://www.artstation.com/assets/artworks/Leonardo_Hernandes/12345678')] bg-cover bg-center"></div>
        </div>

        <!-- Main Content -->
        <div class="relative z-10 max-w-2xl w-full p-8 bg-gray-800 bg-opacity-80 rounded-2xl shadow-2xl backdrop-blur-lg animate-fade-in">
            <div class="flex flex-col items-center text-center">
                <!-- Logo with animation -->
                <img :src="manifest.logo" alt="Logo" class="w-32 mb-6 transform transition-transform duration-500 hover:scale-110">

                <!-- Title and Version -->
                <h1 class="text-4xl font-bold mb-2">{{ manifest.name }}</h1>
                <h2 class="text-lg font-medium text-gray-400">Version: {{ manifest.version }}</h2>
                <p class="mt-4 text-gray-300 max-w-md">{{ manifest.description }}</p>
            </div>

            <!-- Divider -->
            <div class="my-6 border-t border-gray-700"></div>

            <!-- Features Section -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-3">This addon offers:</h2>
                <ul class="list-disc list-inside text-gray-300 space-y-1">
                    <li>Subtitles in multiple languages</li>
                </ul>
            </div>

            <!-- Important Notice -->
            <div class="mb-6 p-4 bg-yellow-500 bg-opacity-20 rounded-lg">
                <h2 class="text-xl font-semibold text-yellow-300">IMPORTANT:</h2>
                <p class="text-gray-200">Addic7ed limits anonymous users to <span class="font-bold">15 downloads per 24 hours</span> on their IP address.</p>
            </div>

            <!-- Search Section -->
            <form @submit.prevent="searchLists" class="mb-6">
                <label for="searchInput" class="sr-only">Search Language</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg aria-hidden="true" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input v-model="state.searchQuery" type="search" id="searchInput" class="block w-full p-4 pl-10 text-sm bg-gray-700 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-white" placeholder="Search Languages" required>
                    <button type="submit" class="absolute right-2.5 bottom-2.5 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-white transition-colors duration-300">Search</button>
                </div>
            </form>

            <!-- Selected Language -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-2">Selected Language:</h2>
                <h3 class="text-lg text-blue-400">{{ state.Language.name ? state.Language.name : 'None' }}</h3>
            </div>

            <!-- Install Button with animation -->
            <div class="flex justify-center mb-6">
                <a id="install_button" href="#" class="inline-block">
                    <button :disabled="state.isDisabled" type="button" class="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105">Install Addon</button>
                </a>
            </div>

            <!-- Divider -->
            <div class="my-6 border-t border-gray-700"></div>

            <!-- Creator Credit -->
            <p class="text-center text-gray-400">This addon was created by: <span class="font-semibold text-blue-400">Dydhzo</span></p>
        </div>

        <!-- Search Modal -->
        <div id="searchModal" ref="searchModal" tabindex="-1" aria-hidden="true" class="hidden overflow-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full">
            <div class="relative p-4 w-full max-w-2xl h-full md:max-h-screen overflow-hidden">
                <div class="relative bg-gray-800 rounded-lg shadow-lg overflow-y-auto h-full backdrop-blur-lg">
                    <div class="flex justify-between items-start p-4 rounded-t border-b border-gray-700">
                        <h3 class="w-full text-xl font-semibold text-white mr-4">
                            <form @submit.prevent="searchLists" class="w-full">
                                <label for="searchModalInput" class="sr-only">Search Languages</label>
                                <div class="relative">
                                    <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                        <svg aria-hidden="true" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                    <input v-model="state.searchQuery" type="search" id="searchModalInput" class="block p-4 pl-10 w-full text-sm bg-gray-700 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-white" placeholder="Search Languages" required>
                                    <button type="submit" class="text-white absolute right-2.5 bottom-2.5 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 transition-colors duration-300">Search</button>
                                </div>
                            </form>
                        </h3>
                        <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-600 hover:text-white rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" @click="state.modal.toggle">
                            <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                            </svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div class="p-6 space-y-6">
                        <div class="flex flex-col w-full gap-3 z-10">
                            <div v-for="item in state.languages" :key="item.id" class="p-6 bg-gray-700 rounded-lg border border-gray-600 shadow-md transform transition-transform duration-200 hover:scale-102 hover:border-blue-500">
                                <h5 class="mb-2 text-2xl font-bold tracking-tight text-white">{{ item.name }}</h5>
                                <button @click="selectLanguage(item); state.modal.hide()" class="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors duration-300">
                                    Select language
                                    <svg aria-hidden="true" class="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import Modal from 'flowbite/src/components/modal';
import { useHead } from "@vueuse/head";
import * as manifest from '../../manifest.json';
import * as langs from '../../languages.json';
const languages = langs.default;

useHead({
    title: manifest.name + ' - Stremio Addon',
    link: [
        {
            rel: "icon",
            type: "image/svg+xml",
            href: "https://gestdown.info/assets/images/logo.png",
        }
    ],
});

const state = reactive({
    languages: [],
    searchQuery: '',
    modal: null,
    install: null,
    Language: {},
    isDisabled: true,
});

const searchModal = ref();
const installModal = ref();

onMounted(() => {
    state.modal = new Modal(searchModal.value);
    state.install = new Modal(installModal.value);
});

function generateInstallUrl() {
    const configuration = state.Language.id && state.Language.name ? '/' + state.Language.id : '';
    const location = window.location.host + configuration + '/manifest.json';
    document.getElementById("install_button").href = 'stremio://' + location;
}

async function searchLists() {
    state.modal.show();
    state.languages = filtered(languages, 'name', state.searchQuery);
}

function selectLanguage(lang) {
    state.Language = {
        id: lang.id,
        name: lang.name
    };
    state.isDisabled = false;
    generateInstallUrl();
}

function filtered(list, key, value) {
    const filtered = [];
    const reg = new RegExp(value, 'i');
    for (const item of list) {
        if (reg.test(item[key])) {
            filtered.push(item);
        }
    }
    return filtered;
};
</script>

<style scoped>
/* Animation for background gradient */
@keyframes gradient-background {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

/* Fade in animation */
@keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Apply animations */
.animate-gradient-background {
    background-size: 200% 200%;
    animation: gradient-background 15s ease infinite;
}

.animate-fade-in {
    animation: fade-in 0.8s ease-out;
}

/* Scrollbar styling */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #2d3748;
}

::-webkit-scrollbar-thumb {
    background-color: #4a5568;
    border-radius: 16px;
}

::-webkit-scrollbar-thumb:hover {
    background-color: #718096;
}
</style>