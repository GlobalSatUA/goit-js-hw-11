import './css/styles.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

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
  const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = image;
  const link = document.createElement('a');
  link.href = largeImageURL;
  link.title = tags;
  const img = document.createElement('img');
  img.src = largeImageURL;
  img.alt = tags;
  img.loading = 'lazy';
  link.appendChild(img);
  const body = document.createElement('div');
  body.className = 'card-body';
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
  const card = document.createElement('div');
  card.classList.add('card');
  card.appendChild(link);
  card.appendChild(body);
  const gallery = document.querySelector('.gallery');
  gallery.appendChild(card);

  return card.outerHTML;
}




function renderImages(images) {
  const hits = images.hits;
  const cards = hits.map(createImageCard).join('');
  gallery.insertAdjacentHTML('beforeend', cards);
  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'title',
    captionPosition: 'outside',
    captionsDelay: 250,
  });
  lightbox.refresh();
  const { height: cardHeight } = document
    .querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();
  const scrollHeight = cardHeight * hits.length;
  window.scrollTo({
    top: gallery.scrollHeight - scrollHeight,
    behavior: 'smooth',
  });
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
  Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
}

function updateTotalHits(total) {
  totalHits = total;
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
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
        if (hits.length < 20) { 
          hideLoadMoreBtn();
        }
      })
      .catch((error) => console.error(error));
  }
  
  
  form.addEventListener('submit', handleSearch);
  loadMoreBtn.addEventListener('click', handleLoadMore);
  

  
 
