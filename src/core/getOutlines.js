/**
 * https://www.pdftron.com/api/web/CoreControls.Document.html#getBookmarks__anchor
 */
export default () => {
  return window.docViewer.getDocument().getBookmarks();
};
