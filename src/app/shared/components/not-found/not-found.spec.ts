import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    // Configure TestBed for the standalone component
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent, RouterTestingModule],
    }).compileComponents();

    // Create a component fixture
    fixture = TestBed.createComponent(NotFoundComponent);
    // Get the component instance
    component = fixture.componentInstance;
    // Trigger initial data binding
    fixture.detectChanges();
  });

  // Test case 1: Component should create successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test case 2: Should display the 404 heading
  it('should display the 404 heading', () => {
    // Find the h1 element by CSS selector
    const headingElement = fixture.debugElement.query(By.css('h1'));
    // Check if the element exists
    expect(headingElement).toBeTruthy();
    // Check if the element's text content is '404'
    expect(headingElement.nativeElement.textContent).toContain('404');
  });

  // Test case 3: Should display the 'Página no encontrada' message
  it('should display the not found message', () => {
    // Find the paragraph element by CSS selector
    const paragraphElement = fixture.debugElement.query(By.css('p.lead'));
    // Check if the element exists
    expect(paragraphElement).toBeTruthy();
    // Check if the element's text content matches
    expect(paragraphElement.nativeElement.textContent).toContain('Página no encontrada');
  });

  // Test case 4: Should have a link to the home page
  it('should have a link pointing to the home page ("/")', () => {
    // Find the anchor element by CSS selector
    const linkElement = fixture.debugElement.query(By.css('a.btn'));
    // Check if the element exists
    expect(linkElement).toBeTruthy();
    // Check if the routerLink attribute is set to '/'
    expect(linkElement.attributes['routerLink']).toBe('/');
    // Check the button text
    expect(linkElement.nativeElement.textContent).toContain('Volver al inicio');
  });
});
