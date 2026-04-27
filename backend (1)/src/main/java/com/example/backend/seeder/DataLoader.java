package com.example.backend.seeder;

import com.example.backend.models.ERole;
import com.example.backend.models.Hotel;
import com.example.backend.models.Promotion;
import com.example.backend.models.Role;
import com.example.backend.models.Room;
import com.example.backend.models.User;
import com.example.backend.repository.HotelRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.RoomRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.example.backend.repository.PromotionRepository promotionRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedRoles();
        seedAdminUser();
        seedPromotions();
        if (hotelRepository.count() == 0) {
            seedHotelsAndRooms();
        }
    }

    private void seedRoles() {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(ERole.ROLE_USER));
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
            System.out.println("Roles seeded: ROLE_USER, ROLE_ADMIN");
        }
    }

    private void seedAdminUser() {
        String adminEmail = "admin@luxstay.com";
        String adminPassword = "Admin@123";
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User("Admin", adminEmail, passwordEncoder.encode(adminPassword));
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            admin.setRoles(roles);
            userRepository.save(admin);
            System.out.println("Admin user created: " + adminEmail);
        } else {
            // Always ensure password and role are correct on startup
            userRepository.findByEmail(adminEmail).ifPresent(admin -> {
                admin.setPassword(passwordEncoder.encode(adminPassword));
                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);
                admin.setRoles(roles);
                userRepository.save(admin);
                System.out.println("Admin user password reset: " + adminEmail);
            });
        }
    }

    private void seedPromotions() {
        if (promotionRepository.count() == 0) {
            promotionRepository.save(new Promotion("WELCOME10", 10.0, LocalDate.now().plusMonths(6), "10% off on your first booking"));
            promotionRepository.save(new Promotion("SAVE20", 20.0, LocalDate.now().plusMonths(3), "Flat 20% off — limited time offer"));
            promotionRepository.save(new Promotion("LUXSTAY15", 15.0, LocalDate.now().plusMonths(12), "15% off for LuxStay members"));
            promotionRepository.save(new Promotion("SUMMER25", 25.0, LocalDate.now().plusMonths(2), "Summer special — 25% off"));
            System.out.println("Promotions seeded.");
        }
    }

    private void seedHotelsAndRooms() {
        Hotel h1 = createHotel("The Taj Mahal Palace", "Mumbai", "Maharashtra", "A heritage, five-star, luxury hotel built in the Saracenic Revival style.", "https://images.unsplash.com/photo-1596436889106-be35e843f6a6?auto=format&fit=crop&q=80&w=800", 5, "WiFi, Pool, Spa, Sea View", 15000.0, true, "Apollo Bunder, Colaba");
        Hotel h2 = createHotel("The Leela Palace", "New Delhi", "Delhi", "Experience modern luxury combined with the elegance of Indian culture in the heart of Delhi.", "https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&q=80&w=800", 5, "WiFi, Pool, Gym, Fine Dining", 12000.0, true, "Diplomatic Enclave, Chanakyapuri");
        Hotel h3 = createHotel("ITC Grand Chola", "Chennai", "Tamil Nadu", "A testament to the grandeur of the Cholas, featuring incredible architecture and exquisite rooms.", "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800", 5, "WiFi, Pool, Spa, Multiple Restaurants", 10000.0, true, "Little Mount, Guindy");
        Hotel h4 = createHotel("Trident Nariman Point", "Mumbai", "Maharashtra", "Offering breathtaking views of the Arabian Sea and Marine Drive.", "https://images.unsplash.com/photo-1551882547-ff40c0dfe09a?auto=format&fit=crop&q=80&w=800", 4, "WiFi, Gym, Ocean View", 8500.0, false, "Nariman Point");
        Hotel h5 = createHotel("The Oberoi", "Bangalore", "Karnataka", "Located on MG Road, enriched with lush green gardens and natural light.", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=800", 5, "WiFi, Garden, Spa, Bar", 11000.0, true, "MG Road");
        Hotel h6 = createHotel("Taj West End", "Bangalore", "Karnataka", "A lush, 20-acre garden oasis situated right in the center of bustling Bangalore.", "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800", 5, "WiFi, Pool, Historic, Spa", 14000.0, false, "Race Course Road");
        Hotel h7 = createHotel("Taj Falaknuma Palace", "Hyderabad", "Telangana", "A luxurious 5-star hotel stationed inside an authentic grand palace.", "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=800", 5, "WiFi, Library, Pool, Palace Decor", 20000.0, true, "Engine Bowli, Falaknuma");
        Hotel h8 = createHotel("Park Hyatt", "Hyderabad", "Telangana", "One of the most striking architectures representing contemporary art and luxury.", "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=800", 5, "WiFi, Jacuzzi, Wellness Center", 9500.0, false, "Banjara Hills");
        Hotel h9 = createHotel("JW Marriott", "Pune", "Maharashtra", "Premium luxury hotel known for exceptional hospitality and culinary experiences.", "https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&q=80&w=800", 5, "WiFi, Casino, Pool, Lounge", 8000.0, false, "Senapati Bapat Road");
        Hotel h10 = createHotel("Rambagh Palace", "Jaipur", "Rajasthan", "Experience the finest Rajasthani heritage hospitality in this spectacular palace.", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800", 5, "WiFi, Spa, Royal Dining", 25000.0, true, "Bhawani Singh Road");
        Hotel h11 = createHotel("Le Meridien", "Kochi", "Kerala", "Majestically situated surrounded by the serene backwaters of Kerala.", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800", 4, "WiFi, Backwaters View, Ayurveda", 7000.0, false, "Maradu");
        Hotel h12 = createHotel("Novotel", "Goa", "Goa", "A short walk from the beautiful beaches, bringing a blend of fun and tranquility.", "https://images.unsplash.com/photo-1551882547-ff40c0dfe09a?auto=format&fit=crop&q=80&w=800", 4, "WiFi, Beachfront, Pool, Bar", 6500.0, true, "Candolim Beach");

        hotelRepository.saveAll(Arrays.asList(h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11, h12));

        // Create Rooms for the first few hotels to demonstrate
        createRoomsForHotel(h1, 15000.0);
        createRoomsForHotel(h2, 12000.0);
        createRoomsForHotel(h3, 10000.0);
        createRoomsForHotel(h4, 8500.0);
        createRoomsForHotel(h5, 11000.0);
        createRoomsForHotel(h6, 14000.0);
        createRoomsForHotel(h7, 20000.0);
        createRoomsForHotel(h8, 9500.0);
        createRoomsForHotel(h9, 8000.0);
        createRoomsForHotel(h10, 25000.0);
        createRoomsForHotel(h11, 7000.0);
        createRoomsForHotel(h12, 6500.0);
    }

    private Hotel createHotel(String name, String city, String state, String desc, String img, int rating, String amenities, double minPrice, boolean featured, String location) {
        Hotel h = new Hotel();
        h.setName(name);
        h.setCity(city);
        h.setState(state);
        h.setDescription(desc);
        h.setImageUrl(img);
        h.setRating(rating);
        h.setAmenities(amenities);
        h.setMinPrice(minPrice);
        h.setFeatured(featured);
        h.setLocation(location);
        return h;
    }

    private void createRoomsForHotel(Hotel hotel, double basePrice) {
        Room r1 = new Room();
        r1.setHotel(hotel);
        r1.setName("Deluxe Room");
        r1.setType("Deluxe");
        r1.setDescription("A luxurious room with all modern amenities and a beautiful city view.");
        r1.setAmenities("Free WiFi, AC, TV, Minibar");
        r1.setPrice(basePrice);
        r1.setCapacity(2);
        r1.setImageUrl("https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800");
        r1.setAvailable(true);

        Room r2 = new Room();
        r2.setHotel(hotel);
        r2.setName("Premium Suite");
        r2.setType("Suite");
        r2.setDescription("An expansive luxury suite with a separate lounge area designed for absolute comfort.");
        r2.setAmenities("Free WiFi, AC, King Bed, Bathtub, Lounge");
        r2.setPrice(basePrice * 1.8);
        r2.setCapacity(4);
        r2.setImageUrl("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800");
        r2.setAvailable(true);

        Room r3 = new Room();
        r3.setHotel(hotel);
        r3.setName("Standard AC Room");
        r3.setType("AC");
        r3.setDescription("Comfortable, economical air-conditioned room suitable for short stays.");
        r3.setAmenities("Free WiFi, AC, TV");
        r3.setPrice(basePrice * 0.7);
        r3.setCapacity(2);
        r3.setImageUrl("https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800");
        r3.setAvailable(true);

        roomRepository.saveAll(Arrays.asList(r1, r2, r3));
    }
}
