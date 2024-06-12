class UserView {
  updateMeForm({ name, username, profileImage, profileCoverImage, note } = {}) {
    return `<form
        id="app-modal-content-container"
        class="profile profile--form app-modal__modal app-modal__modal--no-padding glassmorph"
        data-type="update-me-form"
        >
        <div class="profile__images">
            <div data-type="previewer">
            <div data-type="edit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path
                    d="M200-200h57l391-391-57-57-391 391v57Zm-40 80q-17 0-28.5-11.5T120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97Zm600-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"
                />
                </svg>
            </div>
            <input
                name="profileCoverImage"
                type="file"
                accept="images/*"
                data-type="update-me-image-preview-input"
            />
            <img
                class="profile__images__cover"
                src="${
                  profileCoverImage
                    ? profileCoverImage
                    : '/Imgs/users/mars-spacex-starship-wallpapers.jpg'
                }"
                data-type="preview"
                alt=""
            />
            </div>
            <div
            class="profile__images__profile"
            data-type="previewer"
            data-for="profileImage"
            >
            <div data-type="edit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path
                    d="M200-200h57l391-391-57-57-391 391v57Zm-40 80q-17 0-28.5-11.5T120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97Zm600-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"
                />
                </svg>
            </div>
            <input
                name="profileImage"
                type="file"
                accept="images/*"
                data-type="update-me-image-preview-input"
            />
            <img src="${profileImage}" alt="" data-type="preview" />
            </div>
            <div id="social-action-btns" class="profile__social-actions">
            <button
                type="button"
                data-type="cancel-update-me"
                class="suggestion__btn-main profile__social-actions__btn profile__social-actions__btn--cancel"
            >
                cancel
            </button>
            <button
                type="submit"
                class="suggestion__btn-main profile__social-actions__btn profile__social-actions__btn--save"
            >
                Save
            </button>
            </div>
        </div>
        <div class="profile__details">
            <div class="profile__details__identity">
            <input
                name="name"
                class="profile__details__name"
                value="${name}"
                placeholder="Name"
                maxlength="30"
                required
            />
            <div class="profile__details__username"><span>@</span>${username}</div>
            </div>
            <input
            class="profile__details__note"
            name="note"
            value="${note || ''}"
            placeholder="A note or quote"
            maxlength="130"
            />
        </div>
    </form>`;
  }
}

export default new UserView();
