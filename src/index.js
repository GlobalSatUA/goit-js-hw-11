import './css/styles.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';

const API_KEY = '35888482-91687ab4dbf94420f0a7f1f80';
const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let pageNumber = 1;
let searchQuery = '';
let totalHits = null;

async function fetchImages() {
  const url = `https://pixabay.com/api/?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${pageNumber}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    return data; 
  } catch (error) {
    console.error(error);
    return [];
  }
}

function createImageCard(image) {
  const { webformatURL, tags, likes, views, comments, downloads } = image;
  const card = document.createElement('div');
  card.className = 'card';
  const img = document.createElement('img');
  img.src = webformatURL;
  img.alt = tags;
  img.loading = 'lazy';
  card.appendChild(img);
  const body = document.createElement('div');
  body.className = 'card-body';
  const title = document.createElement('h3');
  title.textContent = tags;
  body.appendChild(title);
  const list = document.createElement('ul');
  const items = [
    { label: 'Likes', value: likes },
    { label: 'Views', value: views },
    { label: 'Comments', value: comments },
    { label: 'Downloads', value: downloads },
  ];
  for (const { label, value } of items) {
    const item = document.createElement('li');
    const labelEl = document.createElement('b');
    labelEl.textContent = label + ':';
    const valueEl = document.createTextNode(' ' + value);
    item.appendChild(labelEl);
    item.appendChild(valueEl);
    list.appendChild(item);
  }
  body.appendChild(list);
  card.appendChild(body);

  const lightbox = new SimpleLightbox(card, { 
    sourceAttr: 'src',
    captionSelector: 'h3',
  });

  return card.outerHTML;
}

function renderImages(images) {
  const hits = images.hits;
  const cards = hits.map(createImageCard).join('');
  gallery.insertAdjacentHTML('beforeend', cards);
}

function clearGallery() {
  gallery.innerHTML = '';
  hideLoadMoreBtn(); 
}

function showLoadMoreBtn() {
  loadMoreBtn.style.display = 'block';
}

function hideLoadMoreBtn() {
  loadMoreBtn.style.display = 'none';
}

function showNoResultsMessage() {
  Notiflix.Notify.failure('Sorry, no results found');
}

function updateTotalHits(total) {
  totalHits = total;
}
    
function handleSearch(event) {
    event.preventDefault();
    searchQuery = event.target.elements.searchQuery.value.trim();
    if (!searchQuery) {
      return;
    }
    pageNumber = 1;
    clearGallery();
    fetchImages()
      .then((data) => {
        const { total, hits } = data;
        if (total === 0) {
          showNoResultsMessage();
          return;
        }
        updateTotalHits(total);
        renderImages(data);
        showLoadMoreBtn();
      })
      .catch((error) => console.error(error));
  }
  
  function handleLoadMore() {
    pageNumber += 1;
    fetchImages()
      .then((data) => {
        const { hits } = data;
        renderImages(data);
        if (pageNumber * hits.length >= totalHits) {
          hideLoadMoreBtn();
        }
      })
      .catch((error) => console.error(error));
  }
  
  form.addEventListener('submit', handleSearch);
  loadMoreBtn.addEventListener('click', handleLoadMore);
  
  new SimpleLightbox('.gallery img', {
    captionsData: 'alt',
    captionPosition: 'outside',
    captionsDelay: 250,
  });
  
 
